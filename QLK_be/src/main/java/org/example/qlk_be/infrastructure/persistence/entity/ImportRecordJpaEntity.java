package org.example.qlk_be.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.qlk_be.domain.model.ImportRecord;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "imports")
@Getter
@Setter
@NoArgsConstructor
public class ImportRecordJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_code", nullable = false, length = 100)
    private String productCode;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "import_date", nullable = false)
    private LocalDate importDate;

    @Column(name = "import_time", nullable = false)
    private LocalTime importTime;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    public static ImportRecordJpaEntity fromDomain(ImportRecord record) {
        if (record == null) {
            return null;
        }
        ImportRecordJpaEntity entity = new ImportRecordJpaEntity();
        entity.setId(record.getId());
        entity.setProductCode(record.getProductCode());
        entity.setName(record.getName());
        entity.setQuantity(record.getQuantity());
        entity.setImportDate(record.getImportDate());
        entity.setImportTime(record.getImportTime() != null ? record.getImportTime().withNano(0) : null);
        entity.setUserId(record.getUserId());
        return entity;
    }

    public ImportRecord toDomain() {
        return new ImportRecord(
                this.id,
                this.productCode,
                this.name,
                this.quantity,
                this.importDate,
                this.importTime != null ? this.importTime.withNano(0) : null,
                this.userId
        );
    }
}