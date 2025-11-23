'use client';

import { useState, useEffect } from 'react';
import Heading from '@components/Heading/Heading';
import { useRouter } from 'next/navigation';

interface User {
  idUsuario: number;
  nombre: string;
  correo: string;
  estado: string;
  roles: { id: number; nombre: string }[];
}

interface Role {
  id: number;
  nombre: string;
}

// Interfaces para las respuestas de la API
interface ApiResponse<T> {
  items?: T[];
  roles?: Role[];
  message?: string;
  error?: string;
}

const styles = {
  container: { maxWidth: '1400px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  filterSelect: {
    padding: '12px 20px',
    border: '2px solid #cddc39',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '8px',
    fontSize: '14px',
    minWidth: '250px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  tableContainer: {
    background: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #333',
  },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: {
    padding: '16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    borderBottom: '2px solid #333',
    backgroundColor: '#0a0a0a',
    color: 'white',
  },
  td: { padding: '16px', borderBottom: '1px solid #333', color: '#ccc' },
  statusBadge: (estado: string) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    backgroundColor: estado === 'activo' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
    color: estado === 'activo' ? '#4caf50' : '#f44336',
  }),
  rolesList: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px' },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    backgroundColor: '#cddc39',
    color: '#000',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
  },
  roleRemove: {
    background: 'none',
    border: 'none',
    color: '#000',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
    width: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAction: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    backgroundColor: '#cddc39',
    color: '#000',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #333',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#999',
    padding: 0,
    width: '32px',
    height: '32px',
  },
  modalBody: { padding: '24px' },
  rolesGrid: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  roleCard: (isAssigned: boolean) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    border: `2px solid ${isAssigned ? '#cddc39' : '#333'}`,
    borderRadius: '8px',
    backgroundColor: isAssigned ? 'rgba(205, 220, 57, 0.1)' : 'transparent',
  }),
  btnRole: (isAssigned: boolean) => ({
    padding: '8px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: isAssigned ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    backgroundColor: isAssigned ? '#4caf50' : '#cddc39',
    color: isAssigned ? 'white' : '#000',
  }),
  modalFooter: {
    padding: '24px',
    borderTop: '1px solid #333',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btnSecondary: {
    padding: '10px 24px',
    border: '2px solid #333',
    background: 'transparent',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  loadingText: {
    color: '#999',
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center' as const,
    padding: '40px',
    fontSize: '16px',
  },
  successMessage: {
    padding: '12px 20px',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    color: '#4caf50',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #4caf50',
  },
  errorMessage: {
    padding: '12px 20px',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    color: '#f44336',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f44336',
  },
};

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Función auxiliar para manejar errores de API
  const handleApiError = (err: any, defaultMessage: string): string => {
    if (err.message) return err.message;
    if (typeof err === 'string') return err;
    return defaultMessage;
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [selectedRoleFilter]);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener todos los roles disponibles
      // GET /roles/ - Devuelve los roles disponibles
      const rolesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/roles/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Roles response status:', rolesRes.status);

      if (!rolesRes.ok) {
        throw new Error(`Error al cargar roles: ${rolesRes.status}`);
      }

      const rolesData = await rolesRes.json();
      console.log('📦 Roles recibidos:', rolesData);
      
      // El backend puede devolver un array directo o un objeto con 'items'
      const roles = Array.isArray(rolesData) ? rolesData : (rolesData.items || []);
      
      // Validar que roles sea un array válido
      if (!Array.isArray(roles)) {
        console.error('La respuesta de roles no es un array:', rolesData);
        setAvailableRoles([]);
      } else {
        setAvailableRoles(roles);
      }

      // 2. Obtener usuarios (con o sin filtro de rol)
      // GET /api/users?rol - Devuelve usuarios filtrados por rol
      let usersUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users`;
      
      if (selectedRoleFilter) {
        usersUrl += `?rol=${selectedRoleFilter}`;
      }

      const usersRes = await fetch(usersUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Users response status:', usersRes.status);

      if (!usersRes.ok) {
        throw new Error(`Error al cargar usuarios: ${usersRes.status}`);
      }

      const usersData = await usersRes.json();
      console.log('📦 Usuarios recibidos:', usersData);
      
      // Según la documentación, la API devuelve un array directo de usuarios
      const usersList = Array.isArray(usersData) ? usersData : (usersData.items || usersData.users || []);

      // Validar que usersList sea un array
      if (!Array.isArray(usersList)) {
        console.error('La respuesta de usuarios no es un array:', usersData);
        setUsers([]);
        return;
      }

      // 3. Para cada usuario, obtener sus roles específicos
      // GET /api/users/:id/roles - Devuelve: { "idUsuario": "", "roles": [...] }
      const usersWithRoles = await Promise.all(
        usersList.map(async (user: any) => {
          try {
            const userRolesRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.idUsuario}/roles`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            if (userRolesRes.ok) {
              const userRolesData = await userRolesRes.json();
              console.log(`📦 Roles del usuario ${user.idUsuario}:`, userRolesData);
              
              // El backend devuelve: { "idUsuario": "", "roles": [...] }
              const userRoles = userRolesData.roles || [];

              return {
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                correo: user.correo,
                // El estado puede venir como número (1) o string ("activo")
                estado: user.estado === 1 || user.estado === '1' || user.estado === 'activo' ? 'activo' : 'inactivo',
                roles: Array.isArray(userRoles) ? userRoles : [],
              };
            } else {
              console.warn(`No se pudieron cargar roles para usuario ${user.idUsuario}`);
              return {
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                correo: user.correo,
                estado: user.estado === 1 || user.estado === '1' || user.estado === 'activo' ? 'activo' : 'inactivo',
                roles: [],
              };
            }
          } catch (err) {
            console.error(`Error obteniendo roles del usuario ${user.idUsuario}:`, err);
            return {
              idUsuario: user.idUsuario,
              nombre: user.nombre,
              correo: user.correo,
              estado: user.estado === 1 || user.estado === '1' || user.estado === 'activo' ? 'activo' : 'inactivo',
              roles: [],
            };
          }
        })
      );

      setUsers(usersWithRoles);
    } catch (err: any) {
      console.error('💥 Error cargando datos:', err);
      setError(handleApiError(err, 'Error al cargar los datos del servidor'));
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // POST /api/roles/assign
      // Body: { "idUsuario": "", "idRol": "" }
      // Success: 201 - { "message": "Rol asignado correctamente" }
      // Errors: 404/409/400 - { "error": "mensaje de error" }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUsuario: userId,
          idRol: roleId,
        }),
      });

      // Primero obtener el texto de la respuesta
      const responseText = await response.text();
      console.log('📤 Respuesta de assign:', responseText);
      
      // Intentar parsear como JSON
      let result: any = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.warn('Respuesta no es JSON válido:', responseText);
      }

      if (!response.ok) {
        // Según la documentación, los errores vienen en formato: { "error": "mensaje" }
        throw new Error(result.error || `Error ${response.status}: No se pudo asignar el rol`);
      }

      // Según la documentación, el éxito viene en formato: { "message": "..." }
      setSuccessMessage(result.message || 'Rol asignado correctamente');

      // Recargar datos para reflejar cambios
      await loadData();

      // Actualizar usuario seleccionado en el modal si está abierto
      if (selectedUser && selectedUser.idUsuario === userId) {
        const updatedUser = users.find((u) => u.idUsuario === userId);
        if (updatedUser) {
          setSelectedUser({ ...updatedUser });
        }
      }
    } catch (err: any) {
      console.error('Error asignando rol:', err);
      setError(handleApiError(err, 'Error al asignar el rol'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeRole = async (userId: number, roleId: number) => {
    if (!confirm('¿Estás seguro de que deseas revocar este rol?')) {
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // DELETE /api/roles/revoke
      // Body: { "idUsuario": "", "idRol": "" }
      // Success: 200 - { "message": "Rol revocado correctamente" }
      // Errors: 404/400 - { "error": "mensaje de error" }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/revoke`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUsuario: userId,
          idRol: roleId,
        }),
      });

      // Primero obtener el texto de la respuesta
      const responseText = await response.text();
      console.log('📤 Respuesta de revoke:', responseText);
      
      // Intentar parsear como JSON
      let result: any = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.warn('Respuesta no es JSON válido:', responseText);
      }

      if (!response.ok) {
        // Según la documentación, los errores vienen en formato: { "error": "mensaje" }
        throw new Error(result.error || `Error ${response.status}: No se pudo revocar el rol`);
      }

      // Según la documentación, el éxito viene en formato: { "message": "..." }
      setSuccessMessage(result.message || 'Rol revocado correctamente');

      // Recargar datos
      await loadData();

      // Actualizar usuario seleccionado en el modal si está abierto
      if (selectedUser && selectedUser.idUsuario === userId) {
        const updatedUser = users.find((u) => u.idUsuario === userId);
        if (updatedUser) {
          setSelectedUser({ ...updatedUser });
        }
      }
    } catch (err: any) {
      console.error('Error revocando rol:', err);
      setError(handleApiError(err, 'Error al revocar el rol'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <Heading type={2} color='white' text='Gestión de Usuarios y Roles' />
        <div style={styles.loadingText}>Cargando datos...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {successMessage && <div style={styles.successMessage}>{successMessage}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.header}>
        <Heading type={2} color='white' text='Gestión de Usuarios y Roles' />
        <div>
          <select
            style={styles.filterSelect}
            value={selectedRoleFilter}
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'transactions') {
                void router.push('/administrator/transactions');
                setSelectedRoleFilter('');
                return;
              }
              setSelectedRoleFilter(v);
            }}
            disabled={loading || actionLoading}
          >
            <option value=''>Todos los usuarios</option>
            <option value='transactions'>Ver transacciones</option>
            {availableRoles && availableRoles.length > 0 && availableRoles.map((role) => (
              <option key={role.id} value={role.id.toString()}>
                Usuarios con rol: {role.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Correo</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Roles Asignados</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.idUsuario}>
                  <td style={styles.td}>{user.idUsuario}</td>
                  <td style={styles.td}>{user.nombre}</td>
                  <td style={styles.td}>{user.correo}</td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(user.estado)}>{user.estado}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.rolesList}>
                      {user.roles.length > 0 ? (
                        user.roles.map((role) => (
                          <span key={role.id} style={styles.roleBadge}>
                            {role.nombre}
                            <button
                              style={styles.roleRemove}
                              onClick={() => handleRevokeRole(user.idUsuario, role.id)}
                              title='Revocar rol'
                              disabled={actionLoading}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#666', fontStyle: 'italic' }}>Sin roles</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{
                        ...styles.btnAction,
                        opacity: actionLoading ? 0.6 : 1,
                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      disabled={actionLoading}
                    >
                      Asignar Rol
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                  No se encontraron usuarios con el filtro seleccionado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div style={styles.modalOverlay} onClick={() => !actionLoading && setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
                Asignar Rol a {selectedUser.nombre}
              </h3>
              <button
                style={styles.modalClose}
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ color: '#999', marginBottom: '16px' }}>Roles disponibles:</p>
              <div style={styles.rolesGrid}>
                {availableRoles.map((role) => {
                  const isAssigned = selectedUser.roles.some((r) => r.id === role.id);

                  return (
                    <div key={role.id} style={styles.roleCard(isAssigned)}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>
                          {role.nombre}
                        </h4>
                      </div>
                      <button
                        style={{
                          ...styles.btnRole(isAssigned),
                          opacity: actionLoading ? 0.6 : 1,
                        }}
                        onClick={() => {
                          if (!isAssigned && !actionLoading) {
                            handleAssignRole(selectedUser.idUsuario, role.id);
                          }
                        }}
                        disabled={isAssigned || actionLoading}
                      >
                        {actionLoading ? '...' : isAssigned ? '✓ Asignado' : 'Asignar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.btnSecondary}
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}