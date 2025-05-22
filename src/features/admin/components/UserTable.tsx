import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  TablePagination,
  Chip,
  FormControl,
  Select,
  OutlinedInput,
} from "@mui/material";
import Box from "@mui/material/Box";
import { Theme, useTheme } from "@mui/material/styles";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { useAppSelector } from "../../../hooks/useAppSelector";
import { getRoles, getUsers, addRole, removeRole } from "../adminSlice";

const roleData = {
  ADMIN: { label: "Администратор", color: "error" },
  STUDENT: { label: "Студент", color: "primary" },
  EMPLOYEE: { label: "Сотрудник", color: "success" },
  TUTOR: { label: "Преподаватель", color: "warning" },
  REGISTERED: { label: "Зарегистрированный", color: "default" },
};

const UsersTable = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.admin.users) || [];
  const allRoles = useAppSelector((state) => state.admin.roles) || [];
  const status = useAppSelector((state) => state.admin.status);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();

  useEffect(() => {
    if (status === "idle") {
      dispatch(getUsers());
      dispatch(getRoles());
    }
  }, [dispatch, status]);

  const handleRoleSelect = async (email: string, role: string) => {
    console.log("Selected role:", role);
    try {
      await dispatch(addRole({ email, role }));
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const handleRoleRemove = async (email: string, role: string) => {
    try {
      await dispatch(removeRole({ email, role }));
    } catch (error) {
      console.error("Error removing role:", error);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const getStyles = (role: string, selectedRoles: string[], theme: Theme) => {
    return {
      fontWeight:
        selectedRoles.indexOf(role) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 800 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Почта</TableCell>
              <TableCell>Роль</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length > 0 || status != "loading" ? (
              users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow hover key={user.email}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <FormControl sx={{ m: 1, width: "100%" }}>
                        <Select
                          labelId="roles-chip-label"
                          id="roles-multiple-chip"
                          multiple
                          value={Array.from(new Set(user.roles || []))}
                          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  variant="outlined"
                                  key={value}
                                  label={roleData[value]?.label || value}
                                  onDelete={(e) => {
                                    e.stopPropagation();
                                    handleRoleRemove(user.email, value);
                                  }}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  color={roleData[value]?.color}
                                />
                              ))}
                            </Box>
                          )}
                          sx={{
                            "& legend": { display: "none" },
                            "& fieldset": { top: 0 },
                          }}
                        >
                          {allRoles.map((role) => (
                            <MenuItem
                              key={role}
                              value={role}
                              style={getStyles(role, user.roles || [], theme)}
                              onClick={(e) => handleRoleSelect(user.email, role)}
                            >
                              {roleData[role]?.label || role}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>
                  К сожалению, пользователи не найдены.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Записей на странице"
      />
    </Paper>
  );
};

export default UsersTable;