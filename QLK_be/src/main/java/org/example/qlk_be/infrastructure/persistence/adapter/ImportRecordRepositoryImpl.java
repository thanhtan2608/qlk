package org.example.qlk_be.infrastructure.persistence.adapter;

import org.example.qlk_be.domain.model.ImportRecord;
import org.example.qlk_be.domain.repository.ImportRecordRepository;
import org.example.qlk_be.infrastructure.persistence.entity.ImportRecordJpaEntity;
import org.example.qlk_be.infrastructure.persistence.repository.SpringDataImportRecordJpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class ImportRecordRepositoryImpl implements ImportRecordRepository {

    private final SpringDataImportRecordJpaRepository jpaRepository;

    public ImportRecordRepositoryImpl(SpringDataImportRecordJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<ImportRecord> findAll() {
        return jpaRepository.findAll().stream().map(ImportRecordJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<ImportRecord> findById(Integer id) {
        return jpaRepository.findById(id).map(ImportRecordJpaEntity::toDomain);
    }

    @Override
    public List<ImportRecord> findByProductCode(String productCode) {
        return jpaRepository.findByProductCode(productCode)
                .stream()
                .map(ImportRecordJpaEntity::toDomain)
                .toList();
    }

    @Override
    public List<ImportRecord> findByImportDateBetween(LocalDate startDate, LocalDate endDate) {
        return jpaRepository.findByImportDateBetween(startDate, endDate)
                .stream()
                .map(ImportRecordJpaEntity::toDomain)
                .toList();
    }

    @Override
    public ImportRecord save(ImportRecord importRecord) {
        return jpaRepository.save(ImportRecordJpaEntity.fromDomain(importRecord)).toDomain();
    }

    @Override
    public void deleteById(Integer id) {
        jpaRepository.deleteById(id);
    }

    @Override
    public void deleteByProductCode(String productCode) {
        jpaRepository.deleteByProductCode(productCode);
    }

    @Override
    public void deleteAll() {
        jpaRepository.deleteAll();
    }
}
