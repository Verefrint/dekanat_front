// features/institutes/pages/InstituteListPage.tsx
import { useEffect } from 'react';
import { fetchInstitutes } from '../instituteSlice';
import {useAppSelector} from "../../../hooks/useAppSelector.ts";
import {useAppDispatch} from "../../../hooks/useAppDispatch.ts";

const InstituteListPage = () => {
    const dispatch = useAppDispatch();
    const { institutes, status, error } = useAppSelector((state) => state.institutes);

    useEffect(() => {
        dispatch(fetchInstitutes());
    }, [dispatch]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Институты</h1>

            {status === 'loading' && (
                <div className="text-center text-gray-500">Загрузка...</div>
            )}

            {error && (
                <div className="text-center text-red-500">Ошибка: {error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {institutes.map((institute) => (
                    <div
                        key={institute.id}
                        className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                    >
                        <h2 className="text-xl font-semibold mb-2">{institute.name}</h2>
                        <p className="text-gray-600 mb-1">
                            📧 <a href={`mailto:${institute.email}`} className="underline">{institute.email}</a>
                        </p>
                        <p className="text-gray-600">📞 {institute.phone}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstituteListPage;
