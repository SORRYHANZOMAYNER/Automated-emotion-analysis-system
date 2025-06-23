package com.database.repository;

import com.database.modules.Appeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AppealRepository  extends JpaRepository<Appeal, Long>, PagingAndSortingRepository<Appeal,Long> {
    Appeal findByDate(Date date);
}
