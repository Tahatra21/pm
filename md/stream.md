Tambahkan feature pemisahan stream pada modul project ITS.

Kebutuhan:
1. Setiap project harus memiliki 1 stream utama.
2. Stream disimpan sebagai master data di database dan dapat dikelola dari menu admin.
3. Stream default awal:
   - EP & Pembangkit
   - Transmisi
   - Distribusi
   - Korporat
   - Pelayanan Pelanggan

4. Tambahkan master tag project yang juga dikelola dari menu admin.
5. Tag default awal:
   - SA PLN 1
   - SA PLN 2
   - SA ENT 1
   - SA ENT 2

6. Setiap project:
   - wajib memilih 1 stream
   - dapat memiliki 1 atau lebih tag

7. Perubahan database:
   - buat tabel `streams`:
     `id`, `code`, `name`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at`
   - buat tabel `project_tags`:
     `id`, `code`, `name`, `category`, `is_active`, `sort_order`, `created_at`, `updated_at`
   - tambahkan `stream_id` pada tabel `projects`
   - buat tabel relasi `project_tag_relations`:
     `id`, `project_id`, `tag_id`, `created_at`

8. Buat foreign key dan index yang sesuai.

9. Tambahkan menu admin:
   - Master Stream
   - Master Tag

10. Fitur menu admin:
   - list
   - add
   - edit
   - active/inactive
   - sorting order

11. Rules:
   - stream/tag yang sudah dipakai project tidak boleh hard delete
   - gunakan soft delete atau status inactive
   - code dan name harus unik sesuai kebutuhan
   - hanya admin/super admin yang boleh manage master

12. Update form project:
   - field dropdown single select untuk Stream
   - field multi-select untuk Tag
   - stream wajib diisi
   - tag opsional, namun bisa multi select

13. Update halaman list dan dashboard:
   - tampilkan stream dan tag
   - tambahkan filter berdasarkan stream dan tag

14. Tampilkan tag sebagai badge/chip di UI.

15. Buat migration, seed data awal, API/service, validation, dan UI CRUD lengkap.
16. Pastikan implementasi scalable, clean, dan tidak hardcoded di frontend.