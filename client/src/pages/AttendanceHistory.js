import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import '../pages/AttendanceHistory.css';

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendanceHistory = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/attendance/history');
                const data = await response.json();

                if (data.success) {
                    setAttendance(data.history);
                } else {
                    Swal.fire('Sin datos', data.message, 'info');
                }
            } catch (error) {
                console.error('Error al cargar el historial de asistencias:', error);
                Swal.fire('Error', 'Hubo un problema al cargar el historial de asistencias.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceHistory();
    }, []);

    return (
        <div className="attendance-history">
            <h2>Historial de Asistencias</h2>
            {loading ? (
                <p className="text-center">Cargando datos...</p>
            ) : attendance.length > 0 ? (
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>ID Asistencia</th>
                            <th>Nombre del Usuario</th>
                            <th>Correo Electrónico</th>
                            <th>Evento</th>
                            <th>Descripción del Evento</th>
                            <th>Fecha del Evento</th>
                            <th>Zona</th>
                            <th>Ubicación del Asiento</th>
                            <th>Fecha de Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendance.map((record) => (
                            <tr key={record.asistencia_id}>
                                <td>{record.asistencia_id}</td>
                                <td>{record.nombre_usuario}</td>
                                <td>{record.email_usuario}</td>
                                <td>{record.nombre_evento}</td>
                                <td>{record.descripcion_evento}</td>
                                <td>{new Date(record.fecha_evento).toLocaleString()}</td>
                                <td>{record.nombre_zona}</td>
                                <td>{record.ubicacion_asiento}</td>
                                <td>{new Date(record.fecha_asistencia).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center">No se encontraron registros de asistencia.</p>
            )}
        </div>
    );
};

export default AttendanceHistory;
