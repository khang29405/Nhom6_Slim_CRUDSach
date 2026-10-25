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
    // Cần viết 2 hàm:
    //   getById(int $id): ?array          -> trả 1 cuốn sách (kèm ten_loai, JOIN loai_sach), không có thì trả null
    //   update(int $id, array $d): void   -> cập nhật các cột của sách theo $id
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