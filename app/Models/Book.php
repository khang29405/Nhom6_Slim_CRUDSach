<?php
namespace App\Models;

class Book
{
    public function __construct(
        public ?int $ma_dau_sach = null,
        public string $nhan_de = '',
        public string $tac_gia = '',
        public ?string $nha_xuat_ban = null,
        public ?string $mo_ta = null,
        public ?string $hinh_anh = null,
        public ?int $so_trang = null,
        public ?float $gia_bia = null,
        public int $so_luong = 0,
        public string $ma_loai = '',
    ) {}
}
