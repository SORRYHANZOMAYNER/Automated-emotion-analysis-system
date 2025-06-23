package com.database.modules;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "Apeal")
public class Appeal {
    private static final Logger log = LoggerFactory.getLogger(Appeal.class);
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Column(length = 1000000)
    private String image;
    private String emotion;
    private Date date;
    @ManyToOne
    @JsonIgnore
    private User creator;
}
