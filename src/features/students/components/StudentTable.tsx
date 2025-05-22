import React, { useEffect, useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, Container,
    Typography, CircularProgress, Box, TableSortLabel,
    TablePagination, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useAppDispatch } from '../../../hooks/useAppDispatch.ts';
import { useAppSelector } from '../../../hooks/useAppSelector.ts';
import { fetchStudents } from '../studentSlice.ts';
import { useNavigate } from 'react-router-dom';

const StudentTable: React.FC = () => {
    const dispatch = useAppDispatch();
    const { students, status } = useAppSelector(state => state.students);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<keyof string>("surname");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [financialFormFilter, setFinancialFormFilter] = useState('ALL');

    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const handleSort = (field: keyof any) => {
        if (sortBy === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setFinancialFormFilter(e.target.value as string);
        setPage(0);
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const { surname, name, patronymic } = student.person;
            const searchLower = search.toLowerCase();
            const matchesSearch =
                surname.toLowerCase().includes(searchLower) ||
                name.toLowerCase().includes(searchLower) ||
                patronymic.toLowerCase().includes(searchLower);

            const matchesForm =
                financialFormFilter === 'ALL' || student.financialForm === financialFormFilter;

            return matchesSearch && matchesForm;
        });
    }, [students, search, financialFormFilter]);

    const sortedStudents = useMemo(() => {
        return [...filteredStudents].sort((a, b) => {
            const aField = a.person[sortBy as keyof typeof a.person];
            const bField = b.person[sortBy as keyof typeof b.person];
            const aVal = typeof aField === 'string' ? aField.toLowerCase() : aField;
            const bVal = typeof bField === 'string' ? bField.toLowerCase() : bField;

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredStudents, sortBy, sortOrder]);

    const paginatedStudents = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedStudents.slice(start, start + rowsPerPage);
    }, [sortedStudents, page, rowsPerPage]);

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container sx={{ mt: 4 }}>
            <TextField
                label="Поиск по фамилии, имени или отчеству"
                variant="outlined"
                fullWidth
                margin="normal"
                value={search}
                onChange={handleSearchChange}
            />

            <FormControl fullWidth margin="normal">
                <InputLabel>Форма обучения</InputLabel>
                <Select
                    value={financialFormFilter}
                    label="Форма обучения"
                    onChange={handleFilterChange}
                >
                    <MenuItem value="ALL">Все</MenuItem>
                    <MenuItem value="BUDGET">Бюджет</MenuItem>
                    <MenuItem value="CONTRACT">Контракт</MenuItem>
                </Select>
            </FormControl>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {['surname', 'name', 'patronymic'].map((field) => (
                                <TableCell key={field}>
                                    <TableSortLabel
                                        active={sortBy === field}
                                        direction={sortOrder}
                                        onClick={() => handleSort(field)}
                                    >
                                        {({
                                            surname: 'Фамилия',
                                            name: 'Имя',
                                            patronymic: 'Отчество'
                                        } as Record<string, string>)[field]}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Телефон</TableCell>
                            <TableCell>Год поступления</TableCell>
                            <TableCell>Форма обучения</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedStudents.map(student => (
                            <TableRow
                                key={student.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/students/${student.id}`)}
                            >
                                <TableCell>{student.person.surname}</TableCell>
                                <TableCell>{student.person.name}</TableCell>
                                <TableCell>{student.person.patronymic}</TableCell>
                                <TableCell>{student.person.phone}</TableCell>
                                <TableCell>{student.yearStarted}</TableCell>
                                <TableCell>
                                    {student.financialForm === 'BUDGET' ? 'Бюджет' : 'Контракт'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {paginatedStudents.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Студенты не найдены
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={sortedStudents.length}
                page={page}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Container>
    );
};

export default StudentTable;
