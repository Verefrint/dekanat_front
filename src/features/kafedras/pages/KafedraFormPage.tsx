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
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from "../../../hooks/useAppDispatch.ts";
import { useAppSelector } from "../../../hooks/useAppSelector.ts";
import { fetchKafedraById, createKafedra, updateKafedra, deleteKafedra } from "../kafedraSlice.ts";
import { fetchInstitutes } from '../../institutes/instituteSlice.ts';
import { Kafedra } from "../../../types/kafedra.ts";

const initialForm: Omit<Kafedra, 'id'> = {
    name: '',
    email: '',
    phone: '',
    room: '',
    instituteId: 0,
    credentialsNonExpired: false,
};

type FormErrors = {
    name?: string;
    email?: string;
    room?: string;
    phone?: string;
    institute?: string;
};

const KafedraFormPage: React.FC = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const currentId = id ? +id : null;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const kafedraFromStore = useAppSelector(s => s.kafedras.selectedKafedra);
    const { status } = useAppSelector(s => s.kafedras);
    const { institutes } = useAppSelector((s) => s.institutes);

    const [formData, setFormData] = useState<Omit<Kafedra, 'id'>>(initialForm);
    const [errors, setErrors] = useState<FormErrors>({});
    const [serverError, setServerError] = useState<string | null>(null);

    // Состояние для открытия/закрытия модального окна удаления
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchInstitutes());
        if (isEditMode && currentId !== null) {
            dispatch(fetchKafedraById(currentId));
        }
    }, [dispatch, currentId, isEditMode]);

    useEffect(() => {
        if (isEditMode && kafedraFromStore) {
            setFormData({
                name: kafedraFromStore.name,
                email: kafedraFromStore.email,
                room: kafedraFromStore.room,
                phone: kafedraFromStore.phone,
                credentialsNonExpired: kafedraFromStore.credentialsNonExpired,
                instituteId: kafedraFromStore.instituteId,
            });
        }
    }, [kafedraFromStore, isEditMode]);

    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        const { name, email, room, phone, instituteId } = formData;

        if (!name.trim()) errs.name = 'Название обязательно';
        if (!email.trim()) errs.email = 'Адрес электронной почты обязателен';
        if (!phone.trim()) errs.phone = 'Номер телефона обязателен';
        if (!room.trim()) errs.room = 'Номер комнаты обязателен';
        if (!instituteId) errs.institute = 'Институт обязателен';

        return errs;
    };

    const handleChange = (field: string, value: string | number | boolean) => {
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
                const kafedraToUpdate: Kafedra = { id: currentId, ...formData };
                await dispatch(updateKafedra(kafedraToUpdate)).unwrap();
            } else {
                await dispatch(createKafedra(formData)).unwrap();
            }
            navigate('/kafedras');
        } catch (err: any) {
            const msg = err as string;
            setServerError(msg || 'Неизвестная ошибка');
            console.error('Ошибка сохранения кафедры:', err);
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
            await dispatch(deleteKafedra(currentId)).unwrap();
            navigate('/kafedras');
        } catch (err: any) {
            const msg = err as string;
            setDeleteError(msg || 'Ошибка при удалении кафедры');
            console.error('Ошибка удаления кафедры:', err);
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
                    {isEditMode ? 'Редактировать кафедру' : 'Создать кафедру'}
                </Typography>

                <form onSubmit={handleSubmit} noValidate>
                    {/* Все поля формы */}
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
                        label="Адрес электронной почты"
                        value={formData.email}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('email', e.target.value)}
                        error={!!errors.email}
                        helperText={errors.email}
                    />

                    <TextField
                        label="Номер телефона"
                        value={formData.phone}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('phone', e.target.value)}
                        error={!!errors.phone}
                        helperText={errors.phone}
                    />

                    <TextField
                        label="Номер комнаты"
                        value={formData.room}
                        fullWidth
                        margin="normal"
                        onChange={e => handleChange('room', e.target.value)}
                        error={!!errors.room}
                        helperText={errors.room}
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="institute-filter-label">Институт</InputLabel>
                        <Select
                            labelId="institute-filter-label"
                            value={formData.instituteId}
                            onChange={(e) => handleChange('instituteId', Number(e.target.value))}
                            label="Институт"
                        >
                            {institutes.map((institute) => (
                                <MenuItem key={institute.id} value={institute.id}>
                                    {institute.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControlLabel
                        control={
                            <Switch
                            checked={formData.credentialsNonExpired}
                            onChange={(e) => handleChange('credentialsNonExpired', e.target.checked)}
                            color="primary"
                            />
                        }
                        label="Срок действия учётных данных не истёк"
                        labelPlacement="start"
                        sx={{ 
                            justifyContent: 'space-between',
                            marginLeft: 0,
                            marginTop: 2,
                            marginBottom: 2
                        }}
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
                            Вы уверены, что хотите удалить кафедру? Это действие нельзя будет отменить.
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

export default KafedraFormPage;
