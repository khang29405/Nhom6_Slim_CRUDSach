-- seed.sql - Dữ liệu mẫu cho loại sách và đầu sách (Sơn)
-- Import sau schema.sql. Có thể import lại nhiều lần: các sách mẫu cũ (có ảnh bìa
-- từ Open Library) được xóa rồi thêm lại, sách do người dùng tự thêm không bị ảnh hưởng.
-- Ảnh bìa lấy từ Open Library: https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg

USE bookstore;
SET NAMES utf8mb4;

-- ---------------------------------------------------------------------
-- Loại sách (nếu mã đã có thì cập nhật lại tên loại)
-- ---------------------------------------------------------------------
INSERT INTO loai_sach (ma_loai, ten_loai) VALUES
    ('KINHT', 'Kinh tế'),
    ('THIEU', 'Thiếu nhi'),
    ('VANHO', 'Văn học')
ON DUPLICATE KEY UPDATE ten_loai = VALUES(ten_loai);

-- ---------------------------------------------------------------------
-- Đầu sách: xóa sách mẫu cũ (nếu có) rồi thêm lại
-- ---------------------------------------------------------------------
DELETE FROM sach WHERE hinh_anh LIKE 'https://covers.openlibrary.org/%';

INSERT INTO sach (nhan_de, tac_gia, nha_xuat_ban, mo_ta, hinh_anh, so_trang, gia_bia, so_luong, ma_loai) VALUES
    -- ===== Kinh tế =====
    ('Rich Dad Poor Dad', 'Robert T. Kiyosaki', 'Plata Publishing',
     'Hai người cha với hai cách nhìn khác nhau về tiền bạc, và bài học về tài chính cá nhân rút ra từ đó.',
     'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', 336, 189000.00, 15, 'KINHT'),
    ('The Intelligent Investor', 'Benjamin Graham', 'Harper Business',
     'Cuốn sách kinh điển về đầu tư giá trị, nhấn mạnh sự kỷ luật và biên an toàn.',
     'https://covers.openlibrary.org/b/isbn/9780060555665-L.jpg', 640, 249000.00, 6, 'KINHT'),
    ('Thinking, Fast and Slow', 'Daniel Kahneman', 'Farrar, Straus and Giroux',
     'Phân tích hai hệ thống tư duy của con người và những sai lệch thường gặp khi ra quyết định.',
     'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', 499, 229000.00, 9, 'KINHT'),
    ('How to Win Friends and Influence People', 'Dale Carnegie', 'Pocket Books',
     'Những nguyên tắc giao tiếp và ứng xử giúp xây dựng các mối quan hệ tốt đẹp.',
     'https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg', 288, 129000.00, 25, 'KINHT'),
    ('Atomic Habits', 'James Clear', 'Avery',
     'Cách xây dựng thói quen tốt và bỏ thói quen xấu bằng những thay đổi nhỏ nhưng đều đặn.',
     'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 320, 169000.00, 14, 'KINHT'),
    ('The Lean Startup', 'Eric Ries', 'Crown Business',
     'Phương pháp khởi nghiệp tinh gọn: thử nghiệm nhanh, đo lường và điều chỉnh liên tục.',
     'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg', 336, 179000.00, 8, 'KINHT'),
    ('Zero to One', 'Peter Thiel', 'Crown Business',
     'Quan điểm về cách xây dựng những công ty tạo ra điều hoàn toàn mới thay vì sao chép cái đã có.',
     'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg', 224, 159000.00, 11, 'KINHT'),
    ('Good to Great', 'Jim Collins', 'HarperBusiness',
     'Nghiên cứu vì sao một số công ty vươn lên từ tốt thành xuất sắc và duy trì được thành công.',
     'https://covers.openlibrary.org/b/isbn/9780066620992-L.jpg', 320, 199000.00, 4, 'KINHT'),
    ('The Psychology of Money', 'Morgan Housel', 'Harriman House',
     'Những câu chuyện ngắn về cách hành vi và tâm lý chi phối các quyết định tiền bạc của chúng ta.',
     'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg', 256, 149000.00, 17, 'KINHT'),
    ('Freakonomics', 'Steven D. Levitt, Stephen J. Dubner', 'William Morrow',
     'Dùng công cụ kinh tế học để giải thích những hiện tượng đời sống tưởng như không liên quan.',
     'https://covers.openlibrary.org/b/isbn/9780060731335-L.jpg', 315, 169000.00, 0, 'KINHT'),

    -- ===== Thiếu nhi =====
    ('The Little Prince', 'Antoine de Saint-Exupéry', 'Harcourt',
     'Cuộc gặp gỡ giữa một phi công lạc giữa sa mạc và cậu hoàng tử nhỏ đến từ một hành tinh xa xôi.',
     'https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg', 96, 99000.00, 20, 'THIEU'),
    ('Charlotte''s Web', 'E. B. White', 'HarperCollins',
     'Tình bạn giữa chú heo Wilbur và nhện Charlotte trong một trang trại.',
     'https://covers.openlibrary.org/b/isbn/9780064400558-L.jpg', 192, 89000.00, 0, 'THIEU'),
    ('Harry Potter and the Sorcerer''s Stone', 'J. K. Rowling', 'Scholastic',
     'Cậu bé Harry phát hiện mình là phù thủy và bắt đầu năm học đầu tiên ở trường Hogwarts.',
     'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg', 309, 159000.00, 12, 'THIEU'),
    ('Matilda', 'Roald Dahl', 'Puffin',
     'Cô bé thông minh Matilda dùng trí tuệ và một khả năng đặc biệt để đối phó với những người lớn xấu tính.',
     'https://covers.openlibrary.org/b/isbn/9780142410370-L.jpg', 240, 99000.00, 13, 'THIEU'),
    ('The Hobbit', 'J. R. R. Tolkien', 'Houghton Mifflin Harcourt',
     'Chuyến phiêu lưu của người hobbit Bilbo cùng nhóm người lùn đi tìm kho báu bị rồng canh giữ.',
     'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', 300, 169000.00, 9, 'THIEU'),
    ('Where the Wild Things Are', 'Maurice Sendak', 'HarperCollins',
     'Cậu bé Max đến vùng đất của những con quái vật và trở thành vua của chúng.',
     'https://covers.openlibrary.org/b/isbn/9780064431781-L.jpg', 48, 119000.00, 6, 'THIEU'),
    ('The Very Hungry Caterpillar', 'Eric Carle', 'Philomel Books',
     'Chú sâu bướm đói bụng ăn hết thứ này đến thứ khác trước khi hóa thành một chú bướm xinh đẹp.',
     'https://covers.openlibrary.org/b/isbn/9780399226908-L.jpg', 26, 129000.00, 22, 'THIEU'),
    ('The Lion, the Witch and the Wardrobe', 'C. S. Lewis', 'HarperCollins',
     'Bốn anh chị em bước qua tủ quần áo và lạc vào thế giới thần kỳ Narnia.',
     'https://covers.openlibrary.org/b/isbn/9780064471046-L.jpg', 208, 109000.00, 10, 'THIEU'),
    ('Charlie and the Chocolate Factory', 'Roald Dahl', 'Puffin',
     'Cậu bé Charlie may mắn được tham quan nhà máy kẹo socola kỳ diệu của ông Wonka.',
     'https://covers.openlibrary.org/b/isbn/9780142410318-L.jpg', 176, 99000.00, 15, 'THIEU'),
    ('Harry Potter and the Chamber of Secrets', 'J. K. Rowling', 'Scholastic',
     'Năm học thứ hai của Harry tại Hogwarts với những vụ tấn công bí ẩn và căn phòng bí mật.',
     'https://covers.openlibrary.org/b/isbn/9780439064873-L.jpg', 341, 169000.00, 11, 'THIEU'),

    -- ===== Văn học =====
    ('The Alchemist', 'Paulo Coelho', 'HarperOne',
     'Hành trình của chàng chăn cừu Santiago đi tìm kho báu và ý nghĩa của giấc mơ.',
     'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', 208, 109000.00, 18, 'VANHO'),
    ('1984', 'George Orwell', 'Signet Classic',
     'Tiểu thuyết viễn tưởng đen tối về một xã hội bị giám sát và kiểm soát tuyệt đối.',
     'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 328, 119000.00, 10, 'VANHO'),
    ('The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner',
     'Câu chuyện về Gatsby và giấc mơ Mỹ giữa thập niên 1920 hào nhoáng.',
     'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', 180, 95000.00, 7, 'VANHO'),
    ('Pride and Prejudice', 'Jane Austen', 'Penguin Classics',
     'Tình yêu và định kiến giữa Elizabeth Bennet và Mr. Darcy trong xã hội Anh thế kỷ 19.',
     'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg', 480, 139000.00, 5, 'VANHO'),
    ('To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial',
     'Câu chuyện về công lý và định kiến chủng tộc nhìn qua đôi mắt của cô bé Scout ở miền Nam nước Mỹ.',
     'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', 336, 139000.00, 12, 'VANHO'),
    ('The Catcher in the Rye', 'J. D. Salinger', 'Little, Brown and Company',
     'Vài ngày lang thang ở New York của cậu thiếu niên Holden Caulfield sau khi bị đuổi học.',
     'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg', 277, 115000.00, 8, 'VANHO'),
    ('Animal Farm', 'George Orwell', 'Signet Classic',
     'Truyện ngụ ngôn về các con vật nổi dậy lật đổ chủ trang trại rồi dần rơi vào một chế độ độc tài mới.',
     'https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg', 144, 79000.00, 19, 'VANHO'),
    ('Brave New World', 'Aldous Huxley', 'Harper Perennial Modern Classics',
     'Viễn cảnh về một xã hội tương lai hạnh phúc bề ngoài nhưng con người bị kiểm soát từ khi sinh ra.',
     'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg', 288, 125000.00, 7, 'VANHO'),
    ('Jane Eyre', 'Charlotte Brontë', 'Penguin Classics',
     'Cuộc đời cô gái mồ côi Jane Eyre từ trường nội trú đến lâu đài Thornfield và tình yêu với ông Rochester.',
     'https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg', 532, 145000.00, 6, 'VANHO'),
    ('The Old Man and the Sea', 'Ernest Hemingway', 'Scribner',
     'Cuộc chiến bền bỉ của ông lão đánh cá Santiago với con cá kiếm khổng lồ giữa biển khơi.',
     'https://covers.openlibrary.org/b/isbn/9780684801223-L.jpg', 127, 89000.00, 13, 'VANHO'),
    ('One Hundred Years of Solitude', 'Gabriel García Márquez', 'Harper Perennial Modern Classics',
     'Biên niên sử bảy thế hệ gia tộc Buendía tại thị trấn Macondo, kể bằng lối hiện thực huyền ảo.',
     'https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg', 417, 155000.00, 5, 'VANHO');