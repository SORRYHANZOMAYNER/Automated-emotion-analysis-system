package com.database.services;

import com.database.modules.Appeal;
import com.database.modules.Appeal;
import com.database.repository.AppealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AppealService {

    private final AppealRepository appealRepository;

    @Autowired
    public AppealService(AppealRepository appealRepository) {
        this.appealRepository = appealRepository;
    }

    public List<Appeal> getAllApeals() {
        return appealRepository.findAll();
    }

    public Appeal createApeal(Appeal apeal) {
        appealRepository.save(apeal);
        return apeal;
    }
    public Appeal getAppealByDate(Date date){
       return appealRepository.findByDate(date);
    }
    public Appeal updateApeal(long id, Appeal apealDetails) {
        Appeal apeal = appealRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apeal not found with id: " + id));
        apeal.setImage(apealDetails.getImage());
        apeal.setEmotion(apealDetails.getEmotion());
        return appealRepository.save(apeal);
    }

    public void deleteApeal(Date date) {
        Appeal apeal = appealRepository.findByDate(date);
        appealRepository.delete(apeal);
    }
}
