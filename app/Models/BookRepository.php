<?php
namespace App\Models;

use PDO;

class BookRepository
{
    public function __construct(private PDO $pdo) {}

    // Thêm sách mới, trả về mã đầu sách vừa tạo (Khang)
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
            'so_trang'     => $d['so_trang'],
            'gia_bia'      => $d['gia_bia'],
            'so_luong'     => $d['so_luong'],
            'ma_loai'      => trim($d['ma_loai']),
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    // Các hàm còn lại do từng thành viên thêm vào bên dưới:
    // getAll(), search($keyword)  -> Minh Tân
    // getById($id), update($id, $d) -> Cang
    // delete($id), getCategories() -> Sơn
}
