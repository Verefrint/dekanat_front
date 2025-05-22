import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    MenuItem,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import {
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../studentSlice';
import { Student } from '../../../types/people';

/* ─────────────────────────── constants ─────────────────────────── */
const currentYear = new Date().getFullYear();
const initialForm: Omit<Student, 'id'> = {
    person: { name: '', surname: '', patronymic: '', phone: '' },
    yearStarted: currentYear,
    financialForm: 'BUDGET'
};
const financialOptions = [
    { value: 'BUDGET', label: 'Бюджет' },
    { value: 'CONTRACT', label: 'Контракт' }
];

/* ─────────────────────────── types ─────────────────────────────── */
type FormField = keyof typeof initialForm.person | 'yearStarted' | 'financialForm';

type FormErrors = Partial<Record<FormField, string>>;

/* ──────────────────────── component ────────────────────────────── */
const StudentFormPage: React.FC = () => {
    /* hooks & store */
    const { id } = useParams<{ id?: string }>();
    const isEdit = Boolean(id);
    const studentId = id ? +id : null;

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedStudent, students, status } = useAppSelector(s => s.students);

    /* local state */
    const [data, setData] = useState(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    /* side‑effects */
    useEffect(() => {
        if (isEdit && studentId !== null) dispatch(fetchStudentById(studentId));
    }, [dispatch, isEdit, studentId]);

    useEffect(() => {
        if (isEdit && selectedStudent) {
            setData({
                person: { ...selectedStudent.person },
                yearStarted: selectedStudent.yearStarted,
                financialForm: selectedStudent.financialForm
            });
        }
    }, [isEdit, selectedStudent]);

    /* validation */
    const validate = (): FormErrors => {
        const e: FormErrors = {};
        const { surname, name, patronymic, phone } = data.person;
        const year = data.yearStarted;

        if (!surname.trim()) e.surname = 'Фамилия обязательна';
        if (!name.trim()) e.name = 'Имя обязательно';
        if (!patronymic.trim()) e.patronymic = 'Отчество обязательно';

        if (!phone.trim()) e.phone = 'Телефон обязателен';
        else if (!/^\+\d{5,15}$/.test(phone)) e.phone = 'Формат: + и 5–15 цифр';

        if (!year || !Number.isInteger(year)) e.yearStarted = 'Неверный год';
        else if (year < 2000 || year > currentYear)
            e.yearStarted = `Год между 2000 и ${currentYear}`;
        else if (students.some(s => s.yearStarted === year && s.id !== studentId))
            e.yearStarted = `Год ${year} уже используется`;

        return e;
    };

    /* handlers */
    const onField = (field: FormField, value: string | number) => {
        setErrors(p => ({ ...p, [field]: undefined }));
        setServerError(null);

        if (field in data.person) {
            setData(d => ({ ...d, person: { ...d.person, [field]: value } }));
        } else {
            setData(d => ({ ...d, [field]: value }));
        }
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length) return;

        try {
            if (isEdit && studentId !== null) {
                await dispatch(updateStudent({ id: studentId, ...data })).unwrap();
            } else {
                await dispatch(createStudent(data)).unwrap();
            }
            navigate('/students');
        } catch (err: any) {
            const msg = String(err ?? '');
            setServerError(
                msg.includes('duplicate') ? 'Студент с таким годом уже есть' : msg
            );
        }
    };

    const onDelete = async () => {
        if (studentId === null) return;
        try {
            await dispatch(deleteStudent(studentId)).unwrap();
            navigate('/students');
        } catch (err: any) {
            setDeleteError(String(err ?? 'Ошибка удаления'));
        }
    };

    /* loader */
    if (isEdit && status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={8}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    /* render */
    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '100vh',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}
        >
            {/* blurred background */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg,#dfe9f3 0%,#ffffff 100%)',
                    backgroundSize: 'cover',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                    zIndex: -1
                }}
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45 }}
                style={{ width: '100%', maxWidth: 520 }}
            >
                <Card
                    elevation={8}
                    sx={{
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(255,255,255,0.75)',
                        borderRadius: 4
                    }}
                >
                    <CardContent component="form" onSubmit={onSubmit}>
                        <Typography variant="h5" align="center" mb={2}>
                            {isEdit ? 'Редактировать студента' : 'Создать студента'}
                        </Typography>

                        {/* inputs */}
                        <TextField
                            label="Фамилия"
                            value={data.person.surname}
                            fullWidth
                            margin="normal"
                            error={!!errors.surname}
                            helperText={errors.surname}
                            onChange={e => onField('surname', e.target.value)}
                        />
                        <TextField
                            label="Имя"
                            value={data.person.name}
                            fullWidth
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name}
                            onChange={e => onField('name', e.target.value)}
                        />
                        <TextField
                            label="Отчество"
                            value={data.person.patronymic}
                            fullWidth
                            margin="normal"
                            error={!!errors.patronymic}
                            helperText={errors.patronymic}
                            onChange={e => onField('patronymic', e.target.value)}
                        />
                        <TextField
                            label="Телефон"
                            value={data.person.phone}
                            fullWidth
                            margin="normal"
                            error={!!errors.phone}
                            helperText={errors.phone}
                            onChange={e => onField('phone', e.target.value)}
                        />
                        <TextField
                            label="Год поступления"
                            type="number"
                            value={data.yearStarted}
                            fullWidth
                            margin="normal"
                            error={!!errors.yearStarted}
                            helperText={errors.yearStarted}
                            onChange={e => onField('yearStarted', +e.target.value)}
                        />
                        <TextField
                            select
                            label="Форма обучения"
                            value={data.financialForm}
                            fullWidth
                            margin="normal"
                            onChange={e => onField('financialForm', e.target.value)}
                        >
                            {financialOptions.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* server error */}
                        {serverError && (
                            <Typography color="error" mt={1}>
                                {serverError}
                            </Typography>
                        )}

                        {/* action buttons */}
                        <Box display="flex" justifyContent="space-between" mt={3}>
                            {isEdit && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                >
                                    Удалить
                                </Button>
                            )}
                            <Button type="submit" variant="contained" size="large">
                                {isEdit ? 'Сохранить' : 'Создать'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </motion.div>

            {/* delete confirmation dialog */}
            <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
                <DialogTitle>Подтвердите удаление</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите удалить этого студента? Это действие не обратимо.
                    </DialogContentText>
                    {deleteError && (
                        <Typography color="error" mt={1}>
                            {deleteError}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)}>Отмена</Button>
                    <Button variant="contained" color="error" onClick={onDelete}>
                        Удалить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudentFormPage;
