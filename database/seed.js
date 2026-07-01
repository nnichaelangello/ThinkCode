const db = require('./db');

const teacher = db.prepare("SELECT id FROM users WHERE role = 'teacher' LIMIT 1").get();
if (!teacher) {
  console.error('Tidak ada akun dosen. Jalankan server sekali dulu agar akun dosen terbentuk.');
  process.exit(1);
}

let courseId;
const existingCourse = db.prepare("SELECT id FROM courses WHERE title = 'Algoritma dan Pemrograman'").get();

if (existingCourse) {
  courseId = existingCourse.id;
  db.prepare("DELETE FROM problems WHERE course_id = ?").run(courseId);
  db.prepare("DELETE FROM chapters WHERE course_id = ?").run(courseId);
  console.log('Kursus sudah ada, menghapus soal dan bab lama untuk di-seed ulang.');
} else {
  const courseResult = db.prepare(
    "INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)"
  ).run(
    'Algoritma dan Pemrograman',
    'Mata kuliah wajib yang membahas dasar-dasar algoritma dan pemrograman menggunakan Python, mulai dari tipe data, operator, percabangan, perulangan, array, fungsi, hingga algoritma pencarian dan pengurutan.',
    teacher.id
  );
  courseId = courseResult.lastInsertRowid;
}

const chapters = [
  'Input, Output, Variabel, dan Tipe Data',
  'Operator Aritmatika, Relasional, dan Logika',
  'Percabangan (if, else)',
  'Perulangan (for, while)',
  'Array (Satu Dimensi)',
  'Fungsi (Function) dan Prosedur',
  'Algoritma Searching',
  'Algoritma Sorting'
];

const chapterIds = [];
for (let i = 0; i < chapters.length; i++) {
  const result = db.prepare(`
    INSERT INTO chapters (course_id, title, order_index) VALUES (?, ?, ?)
  `).run(courseId, chapters[i], i + 1);
  chapterIds.push(result.lastInsertRowid);
}

const problems = [];
const diff = ['easy', 'easy', 'medium', 'medium', 'hard'];

// Bab 1: Input/Output (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[0],
    title: `Soal ${i}: Input dan Tipe Data Dasar`,
    description: `Buatlah program Python yang membaca dua baris input. Baris pertama string (nama), baris kedua angka (umur). Cetak salam.`,
    input_format: 'Baris 1: Nama\nBaris 2: Umur',
    output_format: 'Halo [Nama], umurmu [Umur] tahun.',
    example_input: 'Andi\n20',
    example_output: 'Halo Andi, umurmu 20 tahun.',
    test_cases: JSON.stringify([{input: 'Andi\n20', output: 'Halo Andi, umurmu 20 tahun.'}, {input: 'Budi\n15', output: 'Halo Budi, umurmu 15 tahun.'}]),
    difficulty: diff[i-1]
  });
}

// Bab 2: Operator (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[1],
    title: `Soal ${i}: Operasi Aritmatika`,
    description: `Diberikan dua bilangan a dan b. Hitung hasil a + b, a - b, dan a * b masing-masing di baris baru.`,
    input_format: 'Baris 1: bilangan a\nBaris 2: bilangan b',
    output_format: '3 baris hasil operasi',
    example_input: '10\n3',
    example_output: '13\n7\n30',
    test_cases: JSON.stringify([{input: '10\n3', output: '13\n7\n30'}, {input: '5\n5', output: '10\n0\n25'}]),
    difficulty: diff[i-1]
  });
}

// Bab 3: Percabangan (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[2],
    title: `Soal ${i}: Logika Kondisional`,
    description: `Cek apakah sebuah bilangan n ganjil atau genap. Cetak "Ganjil" atau "Genap".`,
    input_format: 'Bilangan bulat n',
    output_format: '"Ganjil" atau "Genap"',
    example_input: '4',
    example_output: 'Genap',
    test_cases: JSON.stringify([{input: '4', output: 'Genap'}, {input: '7', output: 'Ganjil'}]),
    difficulty: diff[i-1]
  });
}

// Bab 4: Perulangan (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[3],
    title: `Soal ${i}: Loop For/While`,
    description: `Cetak bilangan dari 1 hingga n, satu bilangan per baris.`,
    input_format: 'Bilangan bulat n',
    output_format: 'Bilangan 1 sampai n',
    example_input: '3',
    example_output: '1\n2\n3',
    test_cases: JSON.stringify([{input: '3', output: '1\n2\n3'}, {input: '5', output: '1\n2\n3\n4\n5'}]),
    difficulty: diff[i-1]
  });
}

// Bab 5: Array (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[4],
    title: `Soal ${i}: List dan Array`,
    description: `Diberikan jumlah elemen n, dan n elemen array dipisahkan spasi. Cetak nilai maksimum dalam array tersebut.`,
    input_format: 'Baris 1: n\nBaris 2: elemen dipisah spasi',
    output_format: 'Nilai maksimum',
    example_input: '3\n1 5 3',
    example_output: '5',
    test_cases: JSON.stringify([{input: '3\n1 5 3', output: '5'}, {input: '4\n10 20 5 15', output: '20'}]),
    difficulty: diff[i-1]
  });
}

// Bab 6: Fungsi (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[5],
    title: `Soal ${i}: Pembuatan Fungsi`,
    description: `Buatlah fungsi pangkat(a, b) yang mengembalikan a dipangkatkan b. Cetak hasilnya.`,
    input_format: 'Baris 1: a\nBaris 2: b',
    output_format: 'Hasil a pangkat b',
    example_input: '2\n3',
    example_output: '8',
    test_cases: JSON.stringify([{input: '2\n3', output: '8'}, {input: '5\n2', output: '25'}]),
    difficulty: diff[i-1]
  });
}

// Bab 7: Searching (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[6],
    title: `Soal ${i}: Algoritma Pencarian`,
    description: `Terdapat n elemen array dan target x. Lakukan Linear Search, jika ada cetak "Ada", jika tidak cetak "Tidak Ada".`,
    input_format: 'Baris 1: n\nBaris 2: n elemen array\nBaris 3: target x',
    output_format: '"Ada" atau "Tidak Ada"',
    example_input: '3\n1 2 3\n2',
    example_output: 'Ada',
    test_cases: JSON.stringify([{input: '3\n1 2 3\n2', output: 'Ada'}, {input: '3\n1 2 3\n5', output: 'Tidak Ada'}]),
    difficulty: diff[i-1]
  });
}

// Bab 8: Sorting (5 Soal)
for(let i=1; i<=5; i++) {
  problems.push({
    chapter_id: chapterIds[7],
    title: `Soal ${i}: Algoritma Pengurutan`,
    description: `Urutkan n bilangan secara menaik menggunakan algoritma Bubble Sort. Cetak array yang sudah terurut dipisah spasi.`,
    input_format: 'Baris 1: n\nBaris 2: n bilangan dipisah spasi',
    output_format: 'Array terurut',
    example_input: '4\n4 2 3 1',
    example_output: '1 2 3 4',
    test_cases: JSON.stringify([{input: '4\n4 2 3 1', output: '1 2 3 4'}, {input: '3\n10 5 8', output: '5 8 10'}]),
    difficulty: diff[i-1]
  });
}

const insertProblem = db.prepare(`
  INSERT INTO problems
    (course_id, chapter_id, title, description, input_format, output_format, example_input, example_output, test_cases, difficulty, language_support, time_limit, is_visible)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '["python"]', 5000, 0)
`);

const insertMany = db.transaction((items) => {
  for (const p of items) {
    insertProblem.run(
      courseId, p.chapter_id, p.title, p.description, p.input_format, p.output_format, p.example_input, p.example_output, p.test_cases, p.difficulty
    );
  }
});

insertMany(problems);

console.log(`\n✅ Seed berhasil!`);
console.log(`   Total soal: ${problems.length} soal (5 soal per pertemuan)`);
console.log(`   Silakan cek dashboard teacher.\n`);
