import {
    Box,
    Button,
    Container,
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
import { fetchInstituteById, createInstitute, updateInstitute, deleteInstitute } from "../instituteSlice.ts";
import { Institute } from '../../../types/institute.ts';

const initialForm: Omit<Institute, 'id'> = {
    email: '', 
    name: '', 
    phone: ''
};

type FormErrors = {
    email?: string;
    name?: string;
    phone?: string;
};

const InstituteFormPage: React.FC = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const currentId = id ? +id : null;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const instituteFromStore = useAppSelector(s => s.institutes.selectedInstitute);
    const { status } = useAppSelector(s => s.institutes);

    const [formData, setFormData] = useState<Omit<Institute, 'id'>>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // Состояние для открытия/закрытия модального окна удаления
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode && currentId !== null) {
            dispatch(fetchInstituteById(currentId));
        }
    }, [dispatch, currentId, isEditMode]);

    useEffect(() => {
        if (isEditMode && instituteFromStore) {
            setFormData({
                email: instituteFromStore.email,
                name: instituteFromStore.name,
                phone: instituteFromStore.phone
            });
        }
    }, [instituteFromStore, isEditMode]);

    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        const { email, name, phone } = formData;

        if (!name.trim()) errs.name = 'Имя обязательно';
        if (!email.trim()) errs.email = 'Адрес электронной почты обязателен';

        if (!phone.trim()) {
            errs.phone = 'Телефон обязателен';
        } else if (!/^\+\d{5,15}$/.test(phone)) {
            errs.phone = 'Телефон должен начинаться с + и содержать 5–15 цифр';
        }

        return errs;
    };

    const handleChange = (field: string, value: string | number) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
        setServerError(null);

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError(null);

        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length) return;

        try {
            if (isEditMode && currentId !== null) {
                const instituteToUpdate: Institute = { id: currentId, ...formData };
                await dispatch(updateInstitute(instituteToUpdate)).unwrap();
            } else {
                await dispatch(createInstitute(formData)).unwrap();
            }
            navigate('/institutes');
        } catch (err: any) {
            const msg = err as string;
            setServerError(msg || 'Неизвестная ошибка');
            console.error('Ошибка сохранения института:', err);
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
            await dispatch(deleteInstitute(currentId)).unwrap();
            navigate('/institutes');
        } catch (err: any) {
            const msg = err as string;
            setDeleteError(msg || 'Ошибка при удалении института');
            console.error('Ошибка удаления института:', err);
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
                    {isEditMode ? 'Редактировать института' : 'Создать институт'}
                </Typography>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Все поля формы */}
                    <TextField
                        label="Адрес электронной почты"
                        value={formData.email}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        label="Название"
                        value={formData.name}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('name', e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <TextField
                        label="Телефон"
                        value={formData.phone}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('phone', e.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                    />

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
                            Вы уверены, что хотите удалить институт? Это действие нельзя будет отменить.
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

export default InstituteFormPage;
