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
    Typography,
} from '@mui/material';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { fetchStudents } from '../studentSlice';
import { useNavigate } from 'react-router-dom';

type SortOrder = 'asc' | 'desc';
type Student = ReturnType<typeof fetchStudents> extends any ? any : any; // adjust if you have a Student type

const labels: Record<string, string> = {
    surname: 'Фамилия',
    name: 'Имя',
    patronymic: 'Отчество',
    phone: 'Телефон',
    yearStarted: 'Год поступления',
    financialForm: 'Форма обучения',
};

const financialOptions = [
    { value: 'ALL', label: 'Все' },
    { value: 'BUDGET', label: 'Бюджет' },
    { value: 'CONTRACT', label: 'Контракт' },
];

const columns: { field: keyof any; labelKey: string }[] = [
    { field: 'surname', labelKey: 'surname' },
    { field: 'name', labelKey: 'name' },
    { field: 'patronymic', labelKey: 'patronymic' },
    { field: 'phone', labelKey: 'phone' },
    { field: 'yearStarted', labelKey: 'yearStarted' },
    { field: 'financialForm', labelKey: 'financialForm' },
];

const StudentTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { students, status } = useAppSelector((s) => s.students);
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState<keyof any>('surname');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    // Handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };
    const handleFilter = (e: SelectChangeEvent) => {
        setFilter(e.target.value);
        setPage(0);
    };
    const handleSort = (field: keyof any) => {
        if (sortBy === field) {
            setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
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

    // Data transformations
    const filtered = useMemo(() => {
        const txt = search.toLowerCase();
        return students.filter((st) => {
            const { surname, name, patronymic } = st.person;
            const matchTxt =
                surname.toLowerCase().includes(txt) ||
                name.toLowerCase().includes(txt) ||
                patronymic.toLowerCase().includes(txt);
            const matchFilter = filter === 'ALL' || st.financialForm === filter;
            return matchTxt && matchFilter;
        });
    }, [students, search, filter]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const aVal = a.person[sortBy] ?? a[sortBy];
            const bVal = b.person[sortBy] ?? b[sortBy];
            const va = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
            const vb = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
            if (va < vb) return sortOrder === 'asc' ? -1 : 1;
            if (va > vb) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortBy, sortOrder]);

    const paginated = useMemo(() => {
        const start = page * rowsPerPage;
        return sorted.slice(start, start + rowsPerPage);
    }, [sorted, page, rowsPerPage]);

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                Список студентов
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <TextField
                    label="Поиск"
                    variant="outlined"
                    value={search}
                    onChange={handleSearch}
                />
                <FormControl sx={{ minWidth: 160 }}>
                    <InputLabel>Форма обучения</InputLabel>
                    <Select value={filter} label="Форма обучения" onChange={handleFilter}>
                        {financialOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map(({ field, labelKey }) => (
                                    <TableCell key={field}>
                                        <TableSortLabel
                                            active={sortBy === field}
                                            direction={sortOrder}
                                            onClick={() => handleSort(field)}
                                        >
                                            {labels[labelKey]}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginated.map((st) => (
                                <TableRow
                                    key={st.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/students/${st.id}`)}
                                >
                                    {columns.map(({ field }) => (
                                        <TableCell key={field}>
                                            {field === 'financialForm'
                                                ? labels[st.financialForm.toLowerCase()]
                                                : st.person[field] ?? st[field]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}

                            {paginated.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center">
                                        Студенты не найдены
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
        </Container>
    );
};

export default StudentTable;
