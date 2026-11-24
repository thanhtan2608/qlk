package org.example.qlk_be.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.qlk_be.domain.model.ExportRecord;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "exports")
@Getter
@Setter
@NoArgsConstructor
public class ExportRecordJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_code", nullable = false, length = 100)
    private String productCode;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "export_date", nullable = false)
    private LocalDate exportDate;

    @Column(name = "export_time", nullable = false)
    private LocalTime exportTime;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    public static ExportRecordJpaEntity fromDomain(ExportRecord record) {
        if (record == null) {
            return null;
        }
        ExportRecordJpaEntity entity = new ExportRecordJpaEntity();
        entity.setId(record.getId());
        entity.setProductCode(record.getProductCode());
        entity.setName(record.getName());
        entity.setQuantity(record.getQuantity());
        entity.setExportDate(record.getExportDate());
        entity.setExportTime(record.getExportTime() != null ? record.getExportTime().withNano(0) : null);
        entity.setUserId(record.getUserId());
        return entity;
    }

    public ExportRecord toDomain() {
        return new ExportRecord(
                this.id,
                this.productCode,
                this.name,
                this.quantity,
                this.exportDate,
                this.exportTime != null ? this.exportTime.withNano(0) : null,
                this.userId
        );
    }
}