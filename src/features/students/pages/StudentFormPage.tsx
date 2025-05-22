import {
    Box,
    Button,
    Container,
    MenuItem,
    TextField,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from "../../../hooks/useAppDispatch.ts";
import { useAppSelector } from "../../../hooks/useAppSelector.ts";
import { fetchStudentById, createStudent, updateStudent, deleteStudent } from "../studentSlice.ts"; // Добавили deleteStudent
import { Student } from "../../../types/people.ts";

const initialForm: Omit<Student, 'id'> = {
    person: { name: '', surname: '', patronymic: '', phone: '' },
    yearStarted: new Date().getFullYear(),
    financialForm: 'BUDGET'
};

type FormErrors = {
    surname?: string;
    name?: string;
    patronymic?: string;
    phone?: string;
    yearStarted?: string;
};

const StudentFormPage: React.FC = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const currentId = id ? +id : null;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const studentFromStore = useAppSelector(s => s.students.selectedStudent);
    const { students, status } = useAppSelector(s => s.students);

    const [formData, setFormData] = useState<Omit<Student, 'id'>>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // Состояние для открытия/закрытия модального окна удаления
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && currentId !== null) {
            dispatch(fetchStudentById(currentId));
        }
    }, [dispatch, currentId, isEditMode]);

    useEffect(() => {
        if (isEditMode && studentFromStore) {
            setFormData({
                person: { ...studentFromStore.person },
                yearStarted: studentFromStore.yearStarted,
                financialForm: studentFromStore.financialForm
            });
        }
    }, [studentFromStore, isEditMode]);

    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        const { surname, name, patronymic, phone } = formData.person;
        const year = formData.yearStarted;
        const currentYear = new Date().getFullYear();

        if (!surname.trim()) errs.surname = 'Фамилия обязательна';
        if (!name.trim()) errs.name = 'Имя обязательно';
        if (!patronymic.trim()) errs.patronymic = 'Отчество обязательно';

        if (!phone.trim()) {
            errs.phone = 'Телефон обязателен';
        } else if (!/^\+\d{5,15}$/.test(phone)) {
            errs.phone = 'Телефон должен начинаться с + и содержать 5–15 цифр';
        }

        if (!year || !Number.isInteger(year)) {
            errs.yearStarted = 'Неверный год';
        } else if (year < 2000 || year > currentYear) {
            errs.yearStarted = `Год должен быть между 2000 и ${currentYear}`;
        } else {
            const conflict = students.some(s =>
                s.yearStarted === year && s.id !== currentId
            );
            if (conflict) {
                errs.yearStarted = `Год ${year} уже используется`;
            }
        }

        return errs;
    };

    const handleChange = (field: string, value: string | number) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
        setServerError(null);

        if (['name', 'surname', 'patronymic', 'phone'].includes(field)) {
            setFormData(prev => ({
                ...prev,
                person: {
                    ...prev.person,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length) return;

        try {
            if (isEditMode && currentId !== null) {
                const studentToUpdate: Student = { id: currentId, ...formData };
                await dispatch(updateStudent(studentToUpdate)).unwrap();
            } else {
                await dispatch(createStudent(formData)).unwrap();
            }
            navigate('/students');
        } catch (err: any) {
            const msg = err as string;
            if (msg.includes('duplicate key value violates unique constraint')) {
                setServerError('Студент с таким годом поступления уже существует');
            } else {
                setServerError(msg || 'Неизвестная ошибка');
            }
            console.error('Ошибка сохранения студента:', err);
        }
    };

    // Открыть диалог удаления
    const openDeleteDialog = () => {
        setDeleteError(null);
        setIsDeleteDialogOpen(true);
    };

    // Закрыть диалог удаления
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    };

    // Подтверждение удаления
    const handleDelete = async () => {
        if (currentId === null) return;
        setDeleteError(null);
        try {
            await dispatch(deleteStudent(currentId)).unwrap();
            navigate('/students');
        } catch (err: any) {
            const msg = err as string;
            setDeleteError(msg || 'Ошибка при удалении студента');
            console.error('Ошибка удаления студента:', err);
        }
    };

    if (isEditMode && status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                    {isEditMode ? 'Редактировать студента' : 'Создать студента'}
                </Typography>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Все поля формы */}
                    <TextField
                        label="Фамилия"
                        value={formData.person.surname}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('surname', e.target.value)}
                        error={!!errors.surname}
                        helperText={errors.surname}
                    />

                    <TextField
                        label="Имя"
                        value={formData.person.name}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <TextField
                        label="Отчество"
                        value={formData.person.patronymic}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('patronymic', e.target.value)}
                        error={!!errors.patronymic}
                        helperText={errors.patronymic}
                    />

                    <TextField
                        label="Телефон"
                        value={formData.person.phone}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('phone', e.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                    />

                    <TextField
                        label="Год поступления"
                        type="number"
                        value={formData.yearStarted}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('yearStarted', +e.target.value)}
                        error={!!errors.yearStarted}
                        helperText={errors.yearStarted}
                    />

                    <TextField
                        select
                        label="Форма обучения"
                        value={formData.financialForm}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('financialForm', e.target.value)}
                    >
                        <MenuItem value="BUDGET">Бюджет</MenuItem>
                        <MenuItem value="CONTRACT">Контракт</MenuItem>
                    </TextField>

                    <Box mt={2} display="flex" justifyContent="space-between">
                        {isEditMode && (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={openDeleteDialog}
                            >
                                Удалить
                            </Button>
                        )}
                        <Button type="submit" variant="contained" color="primary">
                            {isEditMode ? 'Сохранить' : 'Создать'}
                        </Button>
                    </Box>

                    {serverError && (
                        <Typography color="error" mt={1}>
                            {serverError}
                        </Typography>
                    )}
                </form>

                {/* Модальное окно подтверждения удаления */}
                <Dialog
                    open={isDeleteDialogOpen}
                    onClose={closeDeleteDialog}
                    aria-labelledby="delete-dialog-title"
                    aria-describedby="delete-dialog-description"
                >
                    <DialogTitle id="delete-dialog-title">Подтвердите удаление</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="delete-dialog-description">
                            Вы уверены, что хотите удалить студента? Это действие нельзя будет отменить.
                        </DialogContentText>
                        {deleteError && (
                            <Typography color="error" mt={1}>
                                {deleteError}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDeleteDialog}>Отмена</Button>
                        <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
                            Удалить
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default StudentFormPage;
