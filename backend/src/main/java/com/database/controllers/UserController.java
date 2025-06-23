package com.database.controllers;

import com.database.config.security.JwtService;
import com.database.dto.TokenDTO;
import com.database.modules.User;
import com.database.services.MinioService;
import com.database.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.security.sasl.AuthenticationException;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api1/v1")
@CrossOrigin(origins = "http://62.109.19.68:4200")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final MinioService minioService;
    private final RestTemplate restTemplate;
    @Autowired
    private JwtService jwtService;

    @Autowired
    public UserController(UserService userService, MinioService minioService, RestTemplate restTemplate) {
        this.userService = userService;
        this.minioService = minioService;
        this.restTemplate = restTemplate;
    }
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> createUser(@RequestBody User user) {
        System.out.println(user);
        if (user.getLogin().length() > 15) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Длина логина должна быть меньше 15 символов"));
        }
        User userFromDB = userService.findByLogin(user.getLogin());

        if (userFromDB != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Такой логин уже существует"));
        } else {
            userService.save(user);
            System.out.println("Пользователь зарегистрирован: " + user);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Успешная регистрация"));
    }
    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@RequestParam String login, @RequestParam String password) {
        TokenDTO tokenDTO = userService.authenticate(login, password);
        return ResponseEntity.ok(tokenDTO);

    }

    @PostMapping("/refresh_token")
    public ResponseEntity<TokenDTO> refreshToken(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        return ResponseEntity.ok(userService.refreshToken(request, response));
    }

    @GetMapping("/userme")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        System.out.println("Token in get: " + token);
        String login = jwtService.extractUsername(token);
        System.out.println("Login in get: " + login);
        User user = userService.findByLogin(login);
        logger.info("Users history: " + user.getAppeals());
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/user/me")
    public void updateUser(@RequestBody User updatedUser, @RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);
        String login = jwtService.extractUsername(token);
        User existingUser = userService.findByLogin(login);
        existingUser.setLogin(updatedUser.getLogin());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());
        userService.updateUser(existingUser);
    }

    @GetMapping("/user")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/user/avatar/me")
    public ResponseEntity<String> uploadAvatar(@RequestParam("image") MultipartFile file,
                                                @RequestHeader("Authorization") String token) {
        try {
            logger.info("Received request to upload avatar with token: {}", token);

            String userLogin = jwtService.extractUsername(token.substring(7));
            if (userLogin == null) {
                logger.warn("Unauthorized access attempt with token: {}", token);
                return ResponseEntity.status(401).body("Unauthorized");
            }

            User currentUser = userService.findByLogin(userLogin);
            if (currentUser == null) {
                logger.warn("User not found for login: {}", userLogin);
                return ResponseEntity.notFound().build();
            }

            String originalFilename = file.getOriginalFilename();
            logger.info("Uploading file: {}, for user: {}", originalFilename, userLogin);

            String fileName = currentUser.getLogin() + "-" + UUID.randomUUID() + "." + getFileExtension(originalFilename);
            String bucket = "avatar";
            String avatarLink = minioService.uploadFile(file.getInputStream(), fileName,bucket);

            currentUser.setAvatar(avatarLink); 
            userService.updateUser(currentUser);

            logger.info("Avatar uploaded successfully for user: {}, file: {}", userLogin, fileName);
            return ResponseEntity.ok("Аватар обновлен успешно: " + avatarLink);
        } catch (Exception e) {
            logger.error("Error uploading avatar", e);
            return ResponseEntity.status(500).body("Ошибка в обновлении аватара: " + e.getMessage());
        }
    }
    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
    @PostMapping("/predict-emotion")
    public ResponseEntity<?> predictEmotion(@RequestParam("image") MultipartFile image,@RequestParam("model") String nameModel) {
        logger.info("Выбранная модель: " + nameModel);
        String pythonApiUrl = "";
        switch (nameModel) {
            case "resnet50":
                pythonApiUrl="http://62.109.19.68:7600/predict/";
                break;
            case "efficientnet-b0":
                pythonApiUrl="http://62.109.19.68:7600/predict/";
                break;
            case "custom":
                pythonApiUrl="http://62.109.19.68:7500/predict/";
                break;
            default:
                pythonApiUrl="НепонятноеИмя";
                break;
        }
        logger.info("Принял запрос, передача на сервер питона " + pythonApiUrl);
        if (image.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Изображение не предоставлено");
        }
    
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            logger.info("Заголовки запроса: " + headers);
            logger.info("Тип файла: " + image.getContentType());
            logger.info("Имя файла: " + image.getOriginalFilename());
    
            byte[] imageBytes = image.getBytes();
            ByteArrayResource byteArrayResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };
    
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", byteArrayResource);
    
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
    
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonApiUrl, requestEntity, Map.class);
    
            logger.info("Статус ответа от Python API: " + response.getStatusCode());
            logger.info("Заголовки ответа: " + response.getHeaders());
            logger.info("Тело ответа: " + response.getBody());
    
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ошибка при обработке изображения");
        }
    }
}