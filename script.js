// دالة لترتيب الطلاب
function sortStudents(students, field, order) {
    return students.sort((a, b) => {
        if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
        return 0;
    });
}

// دالة لتحميل الطلبة من localStorage
function loadStudents() {
    const students = localStorage.getItem('students');
    return students ? JSON.parse(students) : [];
}

// دالة لحفظ الطلبة في localStorage
function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

// دالة لعرض الطلبة في الجدول
function renderStudentsTable(page = 1, perPage = 10) {
    let students = loadStudents();
    
    // تطبيق الترتيب إذا وجدت عناصر التحكم
    const sortField = document.getElementById('sortField')?.value || 'name';
    const sortOrder = document.getElementById('sortOrder')?.value || 'asc';
    students = sortStudents(students, sortField, sortOrder);
    const tableBody = document.getElementById('studentsTable');
    const totalStudents = document.getElementById('totalStudents');
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    // حساب عدد الصفحات
    const totalPages = Math.ceil(students.length / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, students.length);

    // عرض الطلبة
    tableBody.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
        const student = students[i];
        const row = document.createElement('tr');
        row.className = i % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${i + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${student.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${student.age}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="edit.html?id=${i}" class="text-blue-600 hover:text-blue-900 ml-4">تعديل</a>
                <button onclick="showDeleteModal(${i})" class="text-red-600 hover:text-red-900">حذف</button>
            </td>
        `;
        tableBody.appendChild(row);
    }

    // تحديث معلومات الصفحة
    totalStudents.textContent = students.length;
    pageInfo.textContent = `الصفحة ${page} من ${totalPages}`;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;

    // إضافة معالجات الأحداث للأزرار
    prevBtn.onclick = () => renderStudentsTable(page - 1);
    nextBtn.onclick = () => renderStudentsTable(page + 1);
}

// دالة لعرض نموذج تأكيد الحذف
function showDeleteModal(studentId) {
    const modal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    modal.classList.remove('hidden');

    confirmBtn.onclick = () => {
        const students = loadStudents();
        students.splice(studentId, 1);
        saveStudents(students);
        modal.classList.add('hidden');
        renderStudentsTable();
    };

    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };
}

// دالة لإضافة طالب جديد
function addStudent(student) {
    const students = loadStudents();
    students.push(student);
    saveStudents(students);
}

// دالة للتحقق من صحة النموذج
function validateForm(formData) {
    let isValid = true;

    // التحقق من الاسم
    if (!formData.name.trim()) {
        document.getElementById('nameError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('nameError').style.display = 'none';
    }

    // التحقق من البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        document.getElementById('emailError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('emailError').style.display = 'none';
    }

    // التحقق من العمر
    if (formData.age < 5 || formData.age > 99) {
        document.getElementById('ageError').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('ageError').style.display = 'none';
    }

    return isValid;
}

// معالجة إرسال النموذج
if (document.getElementById('studentForm')) {
    const form = document.getElementById('studentForm');
    const successModal = document.getElementById('successModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            age: parseInt(document.getElementById('age').value)
        };

        if (validateForm(formData)) {
            addStudent(formData);
            successModal.classList.remove('hidden');
            form.reset();
        }
    });

    closeSuccessModal.onclick = () => {
        successModal.classList.add('hidden');
        window.location.href = 'list.html';
    };
}

// دالة لتعديل طالب موجود
function updateStudent(id, studentData) {
    const students = loadStudents();
    if (id >= 0 && id < students.length) {
        students[id] = studentData;
        saveStudents(students);
        return true;
    }
    return false;
}

// تهيئة صفحة التعديل
if (document.getElementById('editStudentForm')) {
    const form = document.getElementById('editStudentForm');
    const successModal = document.getElementById('editSuccessModal');
    const closeSuccessModal = document.getElementById('closeEditSuccessModal');
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = parseInt(urlParams.get('id'));
    const students = loadStudents();

    if (studentId >= 0 && studentId < students.length) {
        const student = students[studentId];
        document.getElementById('studentId').value = studentId;
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editAge').value = student.age;
    } else {
        window.location.href = 'list.html';
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            age: parseInt(document.getElementById('editAge').value)
        };

        if (validateForm(formData)) {
            updateStudent(studentId, formData);
            successModal.classList.remove('hidden');
        }
    });

    closeSuccessModal.onclick = () => {
        successModal.classList.add('hidden');
        window.location.href = 'list.html';
    };
}

// دالة لتصدير البيانات إلى CSV
function exportToCSV() {
    const students = loadStudents();
    let csv = 'الاسم,البريد الإلكتروني,العمر\n';
    
    students.forEach(student => {
        csv += `"${student.name}","${student.email}",${student.age}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'الطلبة.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // إضافة معالج حدث لزر التصدير
    const exportBtn = document.getElementById('exportCSV');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }
    if (document.getElementById('studentsTable')) {
        renderStudentsTable();
    }
});