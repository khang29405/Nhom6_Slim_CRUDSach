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
    // Cần viết 2 hàm:
    //   getAll(): array                   -> trả tất cả sách (kèm ten_loai, JOIN loai_sach), mới nhất lên đầu
    //   search(string $keyword): array    -> như getAll nhưng chỉ lấy sách có nhan_de, tac_gia hoặc ten_loai chứa $keyword
    // ===== HẾT phần Minh Tân =====
}