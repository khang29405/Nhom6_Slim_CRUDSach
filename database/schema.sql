-- =====================================================================
-- database/schema_full.sql  -  He thong ban sach online (MySQL)
-- Day du 6 bang theo mo hinh CDM/PDM QUANLYBANSACH:
--   loai_sach, sach, thanh_vien, quan_tri_vien, gio_hang, chua
-- Import bang phpMyAdmin: tab "Nhap/Import" -> chon file nay -> Thuc hien
-- (Demo Slim chi can loai_sach va sach: dung schema.sql + seed.sql)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS bookstore
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bookstore;

-- ---------------------------------------------------------------------
-- 1. loai_sach: ma loai gom dung 5 ky tu
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS loai_sach (
    ma_loai   CHAR(5)      NOT NULL,
    ten_loai  VARCHAR(100) NOT NULL,
    PRIMARY KEY (ma_loai)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. sach (dau sach): moi dau sach thuoc dung 1 loai
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sach (
    ma_dau_sach   INT            NOT NULL AUTO_INCREMENT,
    nhan_de       VARCHAR(255)   NOT NULL,
    tac_gia       VARCHAR(150)   NOT NULL,
    nha_xuat_ban  VARCHAR(150)   NULL,
    mo_ta         TEXT           NULL,
    hinh_anh      VARCHAR(255)   NULL,
    so_trang      INT            NULL,
    gia_bia       DECIMAL(12,2)  NOT NULL,
    so_luong      INT            NOT NULL DEFAULT 0,
    ma_loai       CHAR(5)        NOT NULL,
    PRIMARY KEY (ma_dau_sach),
    CONSTRAINT fk_sach_loai_sach
        FOREIGN KEY (ma_loai) REFERENCES loai_sach (ma_loai)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. thanh_vien: khach hang la thanh vien da mua sach
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS thanh_vien (
    ma_thanh_vien  INT           NOT NULL AUTO_INCREMENT,
    ten_dang_nhap  VARCHAR(50)   NOT NULL,
    mat_khau       VARCHAR(255)  NOT NULL,   -- luu ma bam (hash), khong luu mat khau thuong
    ho_ten         VARCHAR(100)  NOT NULL,
    gioi_tinh      VARCHAR(10)   NULL,
    ngay_sinh      DATE          NULL,
    quoc_tich      VARCHAR(50)   NULL,
    hinh_dai_dien  VARCHAR(255)  NULL,
    PRIMARY KEY (ma_thanh_vien),
    UNIQUE KEY uq_thanh_vien_ten_dang_nhap (ten_dang_nhap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. quan_tri_vien: quan ly website va duyet gio hang
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quan_tri_vien (
    ma_quan_tri_vien  INT           NOT NULL AUTO_INCREMENT,
    ten_dang_nhap     VARCHAR(50)   NOT NULL,
    mat_khau          VARCHAR(255)  NOT NULL,
    ho_ten            VARCHAR(100)  NOT NULL,
    PRIMARY KEY (ma_quan_tri_vien),
    UNIQUE KEY uq_quan_tri_vien_ten_dang_nhap (ten_dang_nhap)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. gio_hang
--    trang_thai: 'Chờ duyệt' | 'Đã duyệt' | 'Không duyệt' | 'Đã hủy'
--    ma_quan_tri_vien, ngay_duyet: de trong khi gio hang chua duoc duyet
--    ly_do_khong_duyet: bat buoc ghi khi quan tri vien khong duyet
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gio_hang (
    ma_gio_hang        INT           NOT NULL AUTO_INCREMENT,
    ma_thanh_vien      INT           NOT NULL,
    ma_quan_tri_vien   INT           NULL,
    ngay_lap           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trang_thai         VARCHAR(20)   NOT NULL DEFAULT 'Chờ duyệt',
    ngay_duyet         DATETIME      NULL,
    ly_do_khong_duyet  VARCHAR(255)  NULL,
    PRIMARY KEY (ma_gio_hang),
    CONSTRAINT fk_gio_hang_thanh_vien
        FOREIGN KEY (ma_thanh_vien) REFERENCES thanh_vien (ma_thanh_vien)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_gio_hang_quan_tri_vien
        FOREIGN KEY (ma_quan_tri_vien) REFERENCES quan_tri_vien (ma_quan_tri_vien)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT ck_gio_hang_trang_thai
        CHECK (trang_thai IN ('Chờ duyệt', 'Đã duyệt', 'Không duyệt', 'Đã hủy'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. chua: chi tiet gio hang (association n-n giua gio_hang va sach)
--    don_gia: gia luc dat hang, de doi gia sach sau nay khong lam sai doanh thu
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chua (
    ma_gio_hang   INT            NOT NULL,
    ma_dau_sach   INT            NOT NULL,
    so_luong_mua  INT            NOT NULL,
    don_gia       DECIMAL(12,2)  NOT NULL,
    PRIMARY KEY (ma_gio_hang, ma_dau_sach),
    CONSTRAINT fk_chua_gio_hang
        FOREIGN KEY (ma_gio_hang) REFERENCES gio_hang (ma_gio_hang)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_chua_sach
        FOREIGN KEY (ma_dau_sach) REFERENCES sach (ma_dau_sach)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT ck_chua_so_luong_mua CHECK (so_luong_mua > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
