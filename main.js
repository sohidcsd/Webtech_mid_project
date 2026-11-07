
var userKey = "hostelManagerUsers";
var studentKey = "hostelStudentRecords";
var roomKey = "hostelRoomRecords";
var paymentKey = "hostelPaymentRecords";

var studentFields = ["student_id", "full_name", "email", "phone", "gender", "dob",
    "department", "admission_date", "guardian_name", "guardian_phone", "address"];
var roomFields = ["room_id", "room_number", "building", "floor_number", "room_type", "room_status"];

var editingPaymentId = "";

// ---------- Common helpers ----------

function readList(key) {
    var data = localStorage.getItem(key);
    if (data == null) {
        return [];
    }
    return JSON.parse(data);
}

function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function showMessage(box, text, type) {
    if (box) {
        box.innerHTML = text;
        box.className = type;
    }
}

function findById(list, field, id) {
    for (var i = 0; i < list.length; i++) {
        if (String(list[i][field]).toLowerCase() == String(id).toLowerCase()) {
            return i;
        }
    }
    return -1;
}

function formToObject(form, fields) {
    var obj = {};
    for (var i = 0; i < fields.length; i++) {
        obj[fields[i]] = form.elements[fields[i]].value;
    }
    return obj;
}

function objectToForm(form, fields, obj) {
    for (var i = 0; i < fields.length; i++) {
        form.elements[fields[i]].value = obj[fields[i]] || "";
    }
}

// ---------- Registration ----------

function usernameExists(users, name) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username.toLowerCase() == name.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function validateForm() {
    error.innerHTML = "";

    if (fullname.value == "") {
        error.innerHTML = "Please enter your full name.";
        return false;
    }
    if (email.value == "") {
        error.innerHTML = "Please enter your email.";
        return false;
    }
    if (email.value.indexOf("@") == -1 || email.value.indexOf(".") == -1) {
        error.innerHTML = "Email is not valid (it needs @ and .).";
        return false;
    }
    if (phone.value == "") {
        error.innerHTML = "Please enter your phone number.";
        return false;
    }
    if (isNaN(phone.value) || phone.value.length != 11) {
        error.innerHTML = "Phone number must be 11 digits.";
        return false;
    }
    if (male.checked == false && female.checked == false && other.checked == false) {
        error.innerHTML = "Please select your gender.";
        return false;
    }
    if (username.value == "") {
        error.innerHTML = "Please enter a username.";
        return false;
    }
    if (username.value.length < 4) {
        error.innerHTML = "Username must be at least 4 characters.";
        return false;
    }
    if (username.value.indexOf(" ") != -1) {
        error.innerHTML = "Username cannot have spaces.";
        return false;
    }

    var users = readList(userKey);

    if (usernameExists(users, username.value)) {
        error.innerHTML = "This username is already taken. Please choose another one.";
        return false;
    }

    var pass = password.value;

    if (pass.length < 6) {
        error.innerHTML = "Password must be at least 6 characters.";
        return false;
    }
    if (/[A-Z]/.test(pass) == false) {
        error.innerHTML = "Password must have at least one capital letter (A-Z).";
        return false;
    }
    if (/[a-z]/.test(pass) == false) {
        error.innerHTML = "Password must have at least one small letter (a-z).";
        return false;
    }
    if (/[0-9]/.test(pass) == false) {
        error.innerHTML = "Password must have at least one number (0-9).";
        return false;
    }
    if (/[^A-Za-z0-9]/.test(pass) == false) {
        error.innerHTML = "Password must have at least one special character (@, #, $, ! etc).";
        return false;
    }
    if (pass != confirmPassword.value) {
        error.innerHTML = "Password and Confirm Password do not match.";
        return false;
    }
    if (terms.checked == false) {
        error.innerHTML = "You must agree to the Terms and Conditions.";
        return false;
    }

    var genderValue = "Other";
    if (male.checked) {
        genderValue = "Male";
    } else if (female.checked) {
        genderValue = "Female";
    }

    users.push({
        fullname: fullname.value,
        email: email.value,
        phone: phone.value,
        gender: genderValue,
        username: username.value,
        password: pass
    });
    writeList(userKey, users);

    alert("Registration successful! Please login.");
    window.location.href = "ml.html";
    return false;
}

// ---------- Login ----------

function loginUser() {
    loginError.innerHTML = "";

    if (username.value == "") {
        loginError.innerHTML = "Please enter your username.";
        return false;
    }
    if (password.value == "") {
        loginError.innerHTML = "Please enter your password.";
        return false;
    }

    var users = readList(userKey);
    var found = false;

    for (var i = 0; i < users.length; i++) {
        if (users[i].username == username.value && users[i].password == password.value) {
            found = true;
        }
    }

    if (found == false) {
        loginError.innerHTML = "Wrong username or password. Please register first if you have no account.";
        return false;
    }

    window.location.href = "md.html";
    return false;
}

// ---------- Logout ----------

function logoutManager() {
    window.location.href = "first.html";
}

// ---------- Student Management ----------

function viewStudentRecords() {
    var students = readList(studentKey);
    var html = "";

    for (var i = 0; i < students.length; i++) {
        var s = students[i];
        html += "<tr>" +
            "<td>" + s.student_id + "</td>" +
            "<td>" + s.full_name + "</td>" +
            "<td>" + s.email + "</td>" +
            "<td>" + s.phone + "</td>" +
            "<td>" + s.gender + "</td>" +
            "<td>" + s.department + "</td>" +
            "<td>" +
            "<button type='button' class='row-button edit-button' onclick='editStudentRow(" + i + ")'>Edit</button>" +
            "<button type='button' class='row-button delete-button' onclick='deleteStudentRow(" + i + ")'>Delete</button>" +
            "</td></tr>";
    }

    studentTableBody.innerHTML = html;
    recordsSection.hidden = false;
    emptyMessage.hidden = students.length != 0;
    return students.length;
}

function editStudentRow(index) {
    var students = readList(studentKey);
    objectToForm(studentForm, studentFields, students[index]);
    showMessage(message, "Student loaded successfully.", "success");
    studentForm.scrollIntoView({ behavior: "smooth" });
}

function deleteStudentRow(index) {
    if (confirm("Do you want to delete this student?")) {
        var students = readList(studentKey);
        students.splice(index, 1);
        writeList(studentKey, students);
        viewStudentRecords();
        showMessage(message, "Student deleted successfully.", "success");
    }
}

function setupStudentPage() {
    addStudent.onclick = function () {
        if (!studentForm.reportValidity()) {
            return;
        }
        var student = formToObject(studentForm, studentFields);
        var students = readList(studentKey);

        if (student.student_id == "" || student.full_name == "") {
            showMessage(message, "Student ID and Name are required.", "error");
            return;
        }
        if (findById(students, "student_id", student.student_id) != -1) {
            showMessage(message, "Student ID already exists.", "error");
            return;
        }

        students.push(student);
        writeList(studentKey, students);
        studentForm.reset();
        viewStudentRecords();
        showMessage(message, "Student added successfully.", "success");
    };

    viewStudents.onclick = function () {
        var total = viewStudentRecords();
        showMessage(message, "Total student records: " + total, "success");
        recordsSection.scrollIntoView({ behavior: "smooth" });
    };

    updateStudent.onclick = function () {
        if (!studentForm.reportValidity()) {
            return;
        }
        var student = formToObject(studentForm, studentFields);
        var students = readList(studentKey);
        var index = findById(students, "student_id", student.student_id);

        if (index == -1) {
            showMessage(message, "Student not found.", "error");
            return;
        }

        students[index] = student;
        writeList(studentKey, students);
        studentForm.reset();
        viewStudentRecords();
        showMessage(message, "Student updated successfully.", "success");
    };

    deleteStudent.onclick = function () {
        var id = studentForm.elements["student_id"].value;
        var students = readList(studentKey);
        var index = findById(students, "student_id", id);

        if (id == "" || index == -1) {
            showMessage(message, "Student not found.", "error");
            return;
        }

        if (confirm("Are you sure you want to delete this student?")) {
            students.splice(index, 1);
            writeList(studentKey, students);
            studentForm.reset();
            viewStudentRecords();
            showMessage(message, "Student deleted successfully.", "success");
        }
    };
}

// ---------- Room Management ----------

function viewRoomRecords() {
    var rooms = readList(roomKey);
    var html = "";

    for (var i = 0; i < rooms.length; i++) {
        var r = rooms[i];
        html += "<tr>" +
            "<td>" + r.room_id + "</td>" +
            "<td>" + r.room_number + "</td>" +
            "<td>" + r.building + "</td>" +
            "<td>" + r.floor_number + "</td>" +
            "<td>" + r.room_type + "</td>" +
            "<td>" + r.room_status + "</td>" +
            "<td>" +
            "<button type='button' class='row-button edit-button' onclick='editRoomRow(" + i + ")'>Edit</button>" +
            "<button type='button' class='row-button delete-button' onclick='deleteRoomRow(" + i + ")'>Delete</button>" +
            "</td></tr>";
    }

    roomTableBody.innerHTML = html;
    roomRecordsSection.hidden = false;
    emptyRooms.hidden = rooms.length != 0;
    return rooms.length;
}

function editRoomRow(index) {
    var rooms = readList(roomKey);
    objectToForm(roomForm, roomFields, rooms[index]);
    showMessage(roomMessage, "Room loaded. Change the information and click Update Room.", "success");
    roomForm.scrollIntoView({ behavior: "smooth" });
}

function deleteRoomRow(index) {
    if (confirm("Do you want to delete this room?")) {
        var rooms = readList(roomKey);
        rooms.splice(index, 1);
        writeList(roomKey, rooms);
        viewRoomRecords();
        showMessage(roomMessage, "Room deleted successfully.", "success");
    }
}

function setupRoomPage() {
    addRoom.onclick = function () {
        if (!roomForm.reportValidity()) {
            return;
        }
        var room = formToObject(roomForm, roomFields);
        var rooms = readList(roomKey);

        if (room.room_id == "" || room.room_number == "") {
            showMessage(roomMessage, "Room ID and Room Number are required.", "error");
            return;
        }
        if (findById(rooms, "room_id", room.room_id) != -1) {
            showMessage(roomMessage, "Room ID already exists.", "error");
            return;
        }

        rooms.push(room);
        writeList(roomKey, rooms);
        roomForm.reset();
        viewRoomRecords();
        showMessage(roomMessage, "Room added successfully.", "success");
    };

    viewRooms.onclick = function () {
        var total = viewRoomRecords();
        showMessage(roomMessage, "Total room records: " + total, "success");
        roomRecordsSection.scrollIntoView({ behavior: "smooth" });
    };

    updateRoom.onclick = function () {
        if (!roomForm.reportValidity()) {
            return;
        }
        var room = formToObject(roomForm, roomFields);
        var rooms = readList(roomKey);
        var index = findById(rooms, "room_id", room.room_id);

        if (index == -1) {
            showMessage(roomMessage, "Room not found.", "error");
            return;
        }

        rooms[index] = room;
        writeList(roomKey, rooms);
        roomForm.reset();
        viewRoomRecords();
        showMessage(roomMessage, "Room updated successfully.", "success");
    };

    deleteRoom.onclick = function () {
        var id = roomForm.elements["room_id"].value;
        var rooms = readList(roomKey);
        var index = findById(rooms, "room_id", id);

        if (id == "" || index == -1) {
            showMessage(roomMessage, "Room not found.", "error");
            return;
        }

        if (confirm("Are you sure you want to delete this room?")) {
            rooms.splice(index, 1);
            writeList(roomKey, rooms);
            roomForm.reset();
            viewRoomRecords();
            showMessage(roomMessage, "Room deleted successfully.", "success");
        }
    };
}

// ---------- Payment Management ----------

function payField(name) {
    return paymentForm.elements[name];
}

function calculateDue() {
    var total = payField("total-fee");
    var paid = payField("paid-amount");

    if (total.value == "" || paid.value == "") {
        payField("due-amount").value = "";
        return;
    }
    payField("due-amount").value = (Number(total.value) - Number(paid.value)).toFixed(2);
}

function getPaymentData() {
    var p = {};
    p.payment_id = payField("payment-id").value;
    p.student_id = payField("student-id").value;
    p.student_name = payField("student-name").value;
    p.fee_month = payField("fee-month").value;
    p.total_fee = Number(payField("total-fee").value);
    p.paid_amount = Number(payField("paid-amount").value);
    p.due_amount = (p.total_fee - p.paid_amount).toFixed(2);
    p.payment_date = payField("payment-date").value;
    p.payment_method = payField("payment-method").value;

    if (p.paid_amount == 0) {
        p.payment_status = "Pending";
    } else if (p.paid_amount == p.total_fee) {
        p.payment_status = "Paid";
    } else {
        p.payment_status = "Partial";
    }
    return p;
}

function clearPaymentForm() {
    paymentForm.reset();
    editingPaymentId = "";
    recordPayment.innerHTML = "Record Payment";
    payField("due-amount").value = "";
}

function viewPaymentRecords() {
    var payments = readList(paymentKey);
    var html = "";

    for (var i = 0; i < payments.length; i++) {
        var p = payments[i];
        html += "<tr>" +
            "<td>" + p.payment_id + "</td>" +
            "<td>" + p.student_id + "</td>" +
            "<td>" + p.student_name + "</td>" +
            "<td>" + p.fee_month + "</td>" +
            "<td>" + p.total_fee + "</td>" +
            "<td>" + p.paid_amount + "</td>" +
            "<td>" + p.due_amount + "</td>" +
            "<td>" + p.payment_date + "</td>" +
            "<td>" + p.payment_method + "</td>" +
            "<td>" + p.payment_status + "</td>" +
            "<td>" +
            "<button type='button' class='row-button edit-button' onclick='editPaymentRow(" + i + ")'>Edit</button>" +
            "<button type='button' class='row-button delete-button' onclick='deletePaymentRow(" + i + ")'>Delete</button>" +
            "</td></tr>";
    }

    paymentTableBody.innerHTML = html;
    paymentRecordsSection.hidden = false;
    paymentCount.innerHTML = "Total payment records: " + payments.length;
    emptyPayments.hidden = payments.length != 0;
    return payments.length;
}

function editPaymentRow(index) {
    var p = readList(paymentKey)[index];

    payField("payment-id").value = p.payment_id;
    payField("student-id").value = p.student_id;
    payField("student-name").value = p.student_name;
    payField("fee-month").value = p.fee_month;
    payField("total-fee").value = p.total_fee;
    payField("paid-amount").value = p.paid_amount;
    payField("due-amount").value = p.due_amount;
    payField("payment-date").value = p.payment_date;
    payField("payment-method").value = p.payment_method;
    payField("payment-status").value = p.payment_status;

    editingPaymentId = p.payment_id;
    recordPayment.innerHTML = "Update Payment";

    showMessage(paymentMessage, "Edit the information and click Update Payment.", "success");
    paymentForm.scrollIntoView({ behavior: "smooth" });
}

function deletePaymentRow(index) {
    if (confirm("Do you want to delete this payment?")) {
        var payments = readList(paymentKey);
        var removed = payments.splice(index, 1)[0];
        writePayments(payments);

        if (editingPaymentId == removed.payment_id) {
            clearPaymentForm();
        }
        viewPaymentRecords();
        showMessage(paymentMessage, "Payment deleted successfully.", "success");
    }
}

function writePayments(payments) {
    writeList(paymentKey, payments);
}

function setupPaymentPage() {
    payField("total-fee").oninput = calculateDue;
    payField("paid-amount").oninput = calculateDue;

    paymentForm.onsubmit = function (event) {
        event.preventDefault();

        if (!paymentForm.reportValidity()) {
            return;
        }

        var payment = getPaymentData();
        var payments = readList(paymentKey);

        if (payment.payment_id == "" || payment.student_id == "" || payment.student_name == "") {
            showMessage(paymentMessage, "Please enter Payment ID, Student ID and Student Name.", "error");
            return;
        }

        if (!Number.isFinite(payment.total_fee) || !Number.isFinite(payment.paid_amount) ||
            payment.total_fee <= 0 || payment.paid_amount < 0 ||
            payment.paid_amount > payment.total_fee) {
            showMessage(paymentMessage, "Please enter valid payment amounts.", "error");
            return;
        }

        if (editingPaymentId != "") {
            var index = findById(payments, "payment_id", editingPaymentId);

            if (index == -1) {
                showMessage(paymentMessage, "Payment record not found.", "error");
                return;
            }

            payment.payment_id = payments[index].payment_id;
            payments[index] = payment;
            writePayments(payments);
            clearPaymentForm();
            viewPaymentRecords();
            showMessage(paymentMessage, "Payment updated successfully.", "success");
        } else {
            if (findById(payments, "payment_id", payment.payment_id) != -1) {
                showMessage(paymentMessage, "Payment ID already exists.", "error");
                return;
            }

            payments.push(payment);
            writePayments(payments);
            clearPaymentForm();
            viewPaymentRecords();
            showMessage(paymentMessage, "Payment recorded successfully.", "success");
        }
    };

    viewPayments.onclick = function () {
        var total = viewPaymentRecords();
        showMessage(paymentMessage, "Total payment records: " + total, "success");
        paymentRecordsSection.scrollIntoView({ behavior: "smooth" });
    };
}

// ---------- Start up (runs after the page has loaded) ----------

window.onload = function () {

    if (typeof studentForm != "undefined") {
        setupStudentPage();
    }

    if (typeof roomForm != "undefined") {
        setupRoomPage();
    }

    if (typeof paymentForm != "undefined") {
        setupPaymentPage();
    }

    // Logout links (class "logout")
    for (var i = 0; i < document.links.length; i++) {
        if (document.links[i].className.indexOf("logout") != -1) {
            document.links[i].onclick = function () {
                logoutManager();
                return false;
            };
        }
    }
};