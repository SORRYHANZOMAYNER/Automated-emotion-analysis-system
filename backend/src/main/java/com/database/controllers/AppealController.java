package com.database.controllers;

import com.database.config.security.JwtService;
import com.database.modules.Appeal;
import com.database.modules.User;
import com.database.services.AppealService;
import com.database.services.MinioService;
import com.database.services.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api1/v1")
@CrossOrigin(origins = "http://62.109.19.68:4200")
public class AppealController {
    private final UserService userService;
    private final AppealService appealService;
    private final MinioService minioService;
    private static final Logger logger = LoggerFactory.getLogger(AppealController.class);
    @Autowired
    private JwtService jwtService;
    @Autowired
    public AppealController(UserService userService, AppealService appealService, MinioService minioService) {
        this.userService = userService;
        this.appealService = appealService;
        this.minioService = minioService;
    }

    @GetMapping("/appeal")
    public List<Appeal> getAllAppeals() {
        return appealService.getAllApeals();
    }
   @PostMapping("/appeal")
    public ResponseEntity<Appeal> createAppeal(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("emotion") String emotion,
            @RequestParam("image") MultipartFile file) {

        try {
            String token = authorizationHeader.substring(7);
            String login = jwtService.extractUsername(token);
            logger.info("User for creating appeal: {}", login);
            logger.info("Appeal fields: {}", emotion);
            Appeal appeal = new Appeal();
            appeal.setEmotion(emotion);
            appeal.setDate(new Date());
            String fileName = login + "-" + UUID.randomUUID() + "." + getFileExtension(file.getOriginalFilename());
            String bucket = "appeals";
            String fileLink = minioService.uploadFile(file.getInputStream(), fileName, bucket);
            appeal.setImage(fileLink); 
            logger.info("Link image: {}", fileLink);
            User user = userService.findByLogin(login);
            if (user != null) {
                user.addAppeal(appeal);
            }

            appealService.createApeal(appeal); 

            return ResponseEntity.ok(appeal);
        } catch (Exception e) {
            logger.error("Error processing appeal with file upload", e);
            return ResponseEntity.status(500).body(null);
        }
    }
    private String getFileExtension(String filename) {
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
    @PutMapping("/appeal/{id}")
    public ResponseEntity<Appeal> updateAppeal(@PathVariable long id, @RequestBody Appeal appealDetails) {
        Appeal updatedApeal = appealService.updateApeal(id, appealDetails);
        return ResponseEntity.ok(updatedApeal);
    }

    @DeleteMapping("/appeal")
    public ResponseEntity<Void> deleteAppeal(@RequestHeader("Authorization") String authorizationHeader,
                                             @RequestParam("date") Date date) {
        logger.info("Start deleting appeal");                              
        try {
            String token = authorizationHeader.substring(7);
            String login = jwtService.extractUsername(token);
            logger.info("User for deleting appeal: {}", login);
            User user = userService.findByLogin(login);
            if (user != null) {
                user.removeAppeal(appealService.getAppealByDate(date));
            }
            appealService.deleteApeal(date);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting appeal with date", e);
            return ResponseEntity.status(500).body(null);
        }
    }
}
