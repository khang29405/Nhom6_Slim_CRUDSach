<?php
namespace App\Models;

use PDO;

class BookRepository
{
    public function __construct(private PDO $pdo) {}

    // ===== Khang: thêm sách (ĐÃ XONG) =====
    // Thêm sách mới, trả về mã đầu sách vừa tạo
        public function create(array $d): int
    {
        $sql = "INSERT INTO sach (nhan_de, tac_gia, nha_xuat_ban, mo_ta, hinh_anh, so_trang, gia_bia, so_luong, ma_loai)
                VALUES (:nhan_de, :tac_gia, :nha_xuat_ban, :mo_ta, :hinh_anh, :so_trang, :gia_bia, :so_luong, :ma_loai)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'nhan_de'      => trim($d['nhan_de']),
            'tac_gia'      => trim($d['tac_gia']),
            'nha_xuat_ban' => $d['nha_xuat_ban'] ?? null,
            'mo_ta'        => $d['mo_ta'] ?? null,
            'hinh_anh'     => $d['hinh_anh'] ?? null,
            'so_trang'     => $d['so_trang'] ?? null,
            'gia_bia'      => $d['gia_bia'],
            'so_luong'     => $d['so_luong'] ?? 0,
            'ma_loai'      => trim($d['ma_loai']),
        ]);
        return (int) $this->pdo->lastInsertId();
    }
    // ===== HẾT phần Khang =====


    // ===== Cang: sửa sách và xem chi tiết =====
        // Lấy 1 cuốn sách theo mã (kèm ten_loai), không có thì trả null
    public function getById(int $id): ?array
    {
        $sql = "SELECT s.*, l.ten_loai
                FROM sach s
                JOIN loai_sach l ON l.ma_loai = s.ma_loai
                WHERE s.ma_dau_sach = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }

    // Cập nhật các cột của sách theo mã
    public function update(int $id, array $d): void
    {
        $sql = "UPDATE sach
                SET nhan_de = :nhan_de, tac_gia = :tac_gia, nha_xuat_ban = :nha_xuat_ban,
                    mo_ta = :mo_ta, hinh_anh = :hinh_anh, so_trang = :so_trang,
                    gia_bia = :gia_bia, so_luong = :so_luong, ma_loai = :ma_loai
                WHERE ma_dau_sach = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'nhan_de'      => trim($d['nhan_de']),
            'tac_gia'      => trim($d['tac_gia']),
            'nha_xuat_ban' => $d['nha_xuat_ban'] ?? null,
            'mo_ta'        => $d['mo_ta'] ?? null,
            'hinh_anh'     => $d['hinh_anh'] ?? null,
            'so_trang'     => $d['so_trang'] ?? null,
            'gia_bia'      => $d['gia_bia'],
            'so_luong'     => $d['so_luong'] ?? 0,
            'ma_loai'      => trim($d['ma_loai']),
            'id'           => $id,
        ]);
    }
    // ===== HẾT phần Cang =====




    // ===== Sơn: xóa sách và danh sách loại sách =====
    // Cần viết 2 hàm:
    //   delete(int $id): bool             -> xóa sách theo $id, trả true nếu có xóa được dòng nào
    //   getCategories(): array            -> trả tất cả loại sách (ma_loai, ten_loai), sắp theo ten_loai
    // ===== HẾT phần Sơn =====




    // ===== Minh Tân: danh sách và tìm kiếm =====
        public function getAll(): array
    {
        $sql = "SELECT s.ma_dau_sach, s.nhan_de, s.tac_gia, s.nha_xuat_ban, s.mo_ta, s.hinh_anh,
                       s.so_trang, s.gia_bia, s.so_luong, s.ma_loai, l.ten_loai
                FROM sach s
                INNER JOIN loai_sach l ON l.ma_loai = s.ma_loai
                ORDER BY s.ma_dau_sach DESC";
        return $this->pdo->query($sql)->fetchAll();
    }

    public function search(string $keyword): array
    {
        $sql = "SELECT s.ma_dau_sach, s.nhan_de, s.tac_gia, s.nha_xuat_ban, s.mo_ta, s.hinh_anh,
                       s.so_trang, s.gia_bia, s.so_luong, s.ma_loai, l.ten_loai
                FROM sach s
                INNER JOIN loai_sach l ON l.ma_loai = s.ma_loai
                WHERE s.nhan_de LIKE :k1 OR s.tac_gia LIKE :k2 OR l.ten_loai LIKE :k3
                ORDER BY s.ma_dau_sach DESC";
        // Escape các ký tự đặc biệt của LIKE (% và _) để tìm đúng nghĩa đen
        $like = '%' . addcslashes(trim($keyword), '\\%_') . '%';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['k1' => $like, 'k2' => $like, 'k3' => $like]);
        return $stmt->fetchAll();
    }
    // ===== HẾT phần Minh Tân =====
}