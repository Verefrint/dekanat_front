import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import AuthLayout from "./layouts/AuthLayout.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import { CssBaseline } from "@mui/material";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import StudentListPage from "./features/students/pages/StudentListPage.tsx";
import StudentFormPage from "./features/students/pages/StudentFormPage.tsx";
import InstituteListPage from "./features/institutes/pages/InstituteListPage.tsx";
import InstituteAdminPage from "./features/institutes/pages/InstituteAdminPage.tsx";
import InstituteFormPage from "./features/institutes/pages/InstituteFormPage.tsx";
import KafedraListPage from "./features/kafedras/pages/KafedraListPage.tsx";
import KafedraFormPage from "./features/kafedras/pages/KafedraFormPage.tsx";

const AuthPage = lazy(() => import("../src/features/auth/pages/AuthPage.tsx"));
const AdminPage = lazy(() => import("../src/features/admin/pages/AdminPage.tsx"));

function App() {

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <CssBaseline />
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/institutes"
                        element={
                                <InstituteListPage />
                        }
                    />
                    <Route
                        path="/institutes/panel"
                        element={
                            <ProtectedRoute>
                                <InstituteAdminPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/institutes/create"
                        element={
                            <ProtectedRoute>
                                <InstituteFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/institutes/:id"
                        element={
                                <InstituteFormPage />
                        }
                    />
                    <Route
                        path="/students"
                        element={
                                <StudentListPage />
                        }
                    />
                    <Route
                        path="/students/create"
                        element={
                            <ProtectedRoute>
                                <StudentFormPage />
                                </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students/:id"
                        element={
                            <ProtectedRoute>
                                <StudentFormPage />
                                </ProtectedRoute>
                        }
                    />
                    
                    <Route
                        path="/kafedras"
                        element={
                                <KafedraListPage />
                        }
                    />
                    <Route
                        path="/kafedras/create"
                        element={
                            <ProtectedRoute>
                                <KafedraFormPage />
                                </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/kafedras/:id"
                        element={
                                <KafedraFormPage />
                        }
                    />
                </Route>
                <Route element={<AuthLayout />}>
                    <Route path="/auth" element={<AuthPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
