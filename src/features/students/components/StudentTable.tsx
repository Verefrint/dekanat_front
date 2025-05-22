// src/features/students/components/StudentTable.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Typography
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { fetchStudents } from '../studentSlice';
import { useNavigate } from 'react-router-dom';

type SortOrder = 'asc' | 'desc';

/* ──────────────── column helpers ──────────────── */
const labels: Record<string, string> = {
    surname: 'Фамилия',
    name: 'Имя',
    patronymic: 'Отчество',
    phone: 'Телефон',
    yearStarted: 'Год поступления',
    financialForm: 'Форма обучения'
};

const formRU: Record<'BUDGET' | 'CONTRACT', string> = {
    BUDGET: 'Бюджет',
    CONTRACT: 'Контракт'
};

const financialOptions = [
    { value: 'ALL', label: 'Все' },
    { value: 'BUDGET', label: formRU.BUDGET },
    { value: 'CONTRACT', label: formRU.CONTRACT }
];

const columns: { field: keyof typeof labels; labelKey: string }[] = [
    { field: 'surname', labelKey: 'surname' },
    { field: 'name', labelKey: 'name' },
    { field: 'patronymic', labelKey: 'patronymic' },
    { field: 'phone', labelKey: 'phone' },
    { field: 'yearStarted', labelKey: 'yearStarted' },
    { field: 'financialForm', labelKey: 'financialForm' }
];

/* ───────────────── component ───────────────── */
const StudentTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { students, status } = useAppSelector(s => s.students);
    const navigate = useNavigate();

    /* UI state */
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState<keyof typeof labels>('surname');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    /* fetch once */
    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    /* handlers */
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };
    const handleFilter = (e: SelectChangeEvent) => {
        setFilter(e.target.value);
        setPage(0);
    };
    const handleSort = (field: keyof typeof labels) => {
        if (sortBy === field) {
            setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };
    const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
    const handleChangeRows = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    /* transforms */
    const filtered = useMemo(() => {
        const txt = search.toLowerCase();
        return students.filter(st => {
            const { surname, name, patronymic } = st.person;
            const matchesText =
                surname.toLowerCase().includes(txt) ||
                name.toLowerCase().includes(txt) ||
                patronymic.toLowerCase().includes(txt);
            const matchesFilter = filter === 'ALL' || st.financialForm === filter;
            return matchesText && matchesFilter;
        });
    }, [students, search, filter]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const aVal = a.person[sortBy as keyof typeof a.person] ?? (a as any)[sortBy];
            const bVal = b.person[sortBy as keyof typeof b.person] ?? (b as any)[sortBy];
            const va = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
            const vb = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
            if (va < vb) return sortOrder === 'asc' ? -1 : 1;
            if (va > vb) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortBy, sortOrder]);

    const pageData = useMemo(() => {
        const start = page * rowsPerPage;
        return sorted.slice(start, start + rowsPerPage);
    }, [sorted, page, rowsPerPage]);

    /* loading state */
    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    /* render */
    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: '50vh',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}
        >
            {/* blurred gradient bg */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(120deg,#dfe9f3 0%,#ffffff 100%)',
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)',
                    zIndex: -1
                }}
            />

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%', maxWidth: 1100 }}
            >
                <Paper
                    elevation={10}
                    sx={{
                        borderRadius: 4,
                        backdropFilter: 'blur(4px)',
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        p: { xs: 2, sm: 3 }
                    }}
                >
                    {/* toolbar */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            mb: 3
                        }}
                    >
                        <TextField
                            label="Поиск (ФИО)"
                            value={search}
                            onChange={handleSearch}
                            fullWidth
                        />
                        <FormControl sx={{ minWidth: 180 }}>
                            <InputLabel>Форма обучения</InputLabel>
                            <Select value={filter} label="Форма обучения" onChange={handleFilter}>
                                {financialOptions.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* table */}
                    <TableContainer sx={{ maxHeight: 540 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {columns.map(col => (
                                        <TableCell key={col.field}>
                                            <TableSortLabel
                                                active={sortBy === col.field}
                                                direction={sortOrder}
                                                onClick={() => handleSort(col.field)}
                                            >
                                                {labels[col.labelKey]}
                                            </TableSortLabel>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pageData.map(st => (
                                    <TableRow
                                        key={st.id}
                                        hover
                                        onClick={() => navigate(`/students/${st.id}`)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{st.person.surname}</TableCell>
                                        <TableCell>{st.person.name}</TableCell>
                                        <TableCell>{st.person.patronymic}</TableCell>
                                        <TableCell>{st.person.phone}</TableCell>
                                        <TableCell>{st.yearStarted}</TableCell>
                                        <TableCell>{formRU[st.financialForm]}</TableCell>
                                    </TableRow>
                                ))}
                                {pageData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} align="center">
                                            <Typography variant="body2" sx={{ py: 4 }}>
                                                Студенты не найдены 😕
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={sorted.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRows}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Paper>
            </motion.div>
        </Box>
    );
};

export default StudentTable;
