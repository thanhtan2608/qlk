package org.example.qlk_be.infrastructure.persistence.adapter;

import org.example.qlk_be.domain.model.ExportRecord;
import org.example.qlk_be.domain.repository.ExportRecordRepository;
import org.example.qlk_be.infrastructure.persistence.entity.ExportRecordJpaEntity;
import org.example.qlk_be.infrastructure.persistence.repository.SpringDataExportRecordJpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class ExportRecordRepositoryImpl implements ExportRecordRepository {

    private final SpringDataExportRecordJpaRepository jpaRepository;

    public ExportRecordRepositoryImpl(SpringDataExportRecordJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public List<ExportRecord> findAll() {
        return jpaRepository.findAll().stream().map(ExportRecordJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<ExportRecord> findById(Integer id) {
        return jpaRepository.findById(id).map(ExportRecordJpaEntity::toDomain);
    }

    @Override
    public List<ExportRecord> findByProductCode(String productCode) {
        return jpaRepository.findByProductCode(productCode)
                .stream()
                .map(ExportRecordJpaEntity::toDomain)
                .toList();
    }

    @Override
    public List<ExportRecord> findByExportDateBetween(LocalDate startDate, LocalDate endDate) {
        return jpaRepository.findByExportDateBetween(startDate, endDate)
                .stream()
                .map(ExportRecordJpaEntity::toDomain)
                .toList();
    }

    @Override
    public ExportRecord save(ExportRecord exportRecord) {
        return jpaRepository.save(ExportRecordJpaEntity.fromDomain(exportRecord)).toDomain();
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
