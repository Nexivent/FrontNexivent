'use client';

import { useState, useEffect } from 'react';
import Heading from '@components/Heading/Heading';
import { useRouter } from 'next/navigation';

interface User {
  idUsuario: number;
  nombre: string;
  correo: string;
  estado: string;
  roles: { idRol: number; nombre: string }[];
}

interface Role {
  idRol: number;
  nombre: string;
}

// MOCK DATA
const MOCK_USERS: User[] = [
  {
    idUsuario: 1,
    nombre: 'Juan Pérez',
    correo: 'juan@email.com',
    estado: 'activo',
    roles: [{ idRol: 2, nombre: 'Organizador' }],
  },
  {
    idUsuario: 2,
    nombre: 'María García',
    correo: 'maria@email.com',
    estado: 'activo',
    roles: [{ idRol: 1, nombre: 'Usuario' }],
  },
  {
    idUsuario: 3,
    nombre: 'Pedro López',
    correo: 'pedro@email.com',
    estado: 'inactivo',
    roles: [],
  },
];

const MOCK_ROLES: Role[] = [
  { idRol: 1, nombre: 'Usuario' },
  { idRol: 2, nombre: 'Organizador' },
  { idRol: 3, nombre: 'Moderador' },
];

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
  const [useAPI, setUseAPI] = useState(false); // Cambiar a true cuando API esté lista

  useEffect(() => {
    loadData();
  }, [selectedRoleFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    if (useAPI) {
      try {
        // 1. Obtener roles disponibles
        const rolesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`);
        if (!rolesRes.ok) throw new Error('Error al cargar roles');
        const rolesData = await rolesRes.json();
        setAvailableRoles(rolesData.items || []);

        // 2. Obtener usuarios (con filtro si está seleccionado)
        const roleParam = selectedRoleFilter || '';
        const usersRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users?rol=${roleParam}`
        );
        if (!usersRes.ok) throw new Error('Error al cargar usuarios');
        const usersData = await usersRes.json();

        // 3. Para cada usuario, obtener sus roles
        const usersWithRoles = await Promise.all(
          (usersData.items || []).map(async (user: any) => {
            try {
              const userRolesRes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.idUsuario}/roles`
              );

              if (userRolesRes.ok) {
                const userRolesData = await userRolesRes.json();
                return {
                  idUsuario: user.idUsuario,
                  nombre: user.nombre,
                  correo: user.correo,
                  estado: user.estado,
                  roles: userRolesData.roles || [],
                };
              }
            } catch (err) {
              console.error(`Error obteniendo roles del usuario ${user.idUsuario}:`, err);
            }

            // Si falla, retorna usuario sin roles
            return {
              idUsuario: user.idUsuario,
              nombre: user.nombre,
              correo: user.correo,
              estado: user.estado,
              roles: [],
            };
          })
        );

        setUsers(usersWithRoles);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos. Usando datos de ejemplo.');
        setUsers(MOCK_USERS);
        setAvailableRoles(MOCK_ROLES);
      }
    } else {
      // VERSION MOCK
      let filteredUsers = MOCK_USERS;

      if (selectedRoleFilter) {
        const roleId = parseInt(selectedRoleFilter);
        filteredUsers = MOCK_USERS.filter((user) =>
          user.roles.some((role) => role.idRol === roleId)
        );
      }

      setUsers(filteredUsers);
      setAvailableRoles(MOCK_ROLES);
    }

    setLoading(false);
  };

  const handleAssignRole = async (userId: number, roleId: number) => {
    if (useAPI) {
      try {
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al asignar rol');
        }

        const result = await response.json();
        console.log('Éxito:', result.message);

        // Recargar datos para reflejar cambios
        await loadData();

        // Actualizar usuario seleccionado en el modal
        if (selectedUser && selectedUser.idUsuario === userId) {
          const updatedUser = users.find((u) => u.idUsuario === userId);
          if (updatedUser) setSelectedUser(updatedUser);
        }
      } catch (err: any) {
        console.error('Error asignando rol:', err);
        alert(err.message || 'Error al asignar el rol');
      }
    } else {
      // VERSION MOCK
      const role = availableRoles.find((r) => r.idRol === roleId);
      if (!role) return;

      setUsers(
        users.map((user) => {
          if (user.idUsuario === userId && !user.roles.find((r) => r.idRol === roleId)) {
            return {
              ...user,
              roles: [...user.roles, { idRol: role.idRol, nombre: role.nombre }],
            };
          }
          return user;
        })
      );

      if (selectedUser && selectedUser.idUsuario === userId) {
        if (!selectedUser.roles.find((r) => r.idRol === roleId)) {
          setSelectedUser({
            ...selectedUser,
            roles: [...selectedUser.roles, { idRol: role.idRol, nombre: role.nombre }],
          });
        }
      }
    }
  };

  const handleRevokeRole = async (userId: number, roleId: number) => {
    if (useAPI) {
      try {
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

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al revocar rol');
        }

        const result = await response.json();
        console.log('Éxito:', result.message);

        // Recargar datos
        await loadData();

        // Actualizar usuario seleccionado en el modal
        if (selectedUser && selectedUser.idUsuario === userId) {
          const updatedUser = users.find((u) => u.idUsuario === userId);
          if (updatedUser) setSelectedUser(updatedUser);
        }
      } catch (err: any) {
        console.error('Error revocando rol:', err);
        alert(err.message || 'Error al revocar el rol');
      }
    } else {
      // VERSION MOCK
      setUsers(
        users.map((user) => {
          if (user.idUsuario === userId) {
            return {
              ...user,
              roles: user.roles.filter((r) => r.idRol !== roleId),
            };
          }
          return user;
        })
      );

      if (selectedUser && selectedUser.idUsuario === userId) {
        setSelectedUser({
          ...selectedUser,
          roles: selectedUser.roles.filter((r) => r.idRol !== roleId),
        });
      }
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

  if (error && useAPI) {
    return (
      <div style={styles.container}>
        <Heading type={2} color='white' text='Gestión de Usuarios y Roles' />
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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
          >
            <option value=''>Todos los usuarios</option>
            <option value='transactions'>Ver transacciones</option>
            {availableRoles.map((role) => (
              <option key={role.idRol} value={role.idRol.toString()}>
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
                          <span key={role.idRol} style={styles.roleBadge}>
                            {role.nombre}
                            <button
                              style={styles.roleRemove}
                              onClick={() => handleRevokeRole(user.idUsuario, role.idRol)}
                              title='Revocar rol'
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
                      style={styles.btnAction}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
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
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
                Asignar Rol a {selectedUser.nombre}
              </h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <p style={{ color: '#999', marginBottom: '16px' }}>Roles disponibles:</p>
              <div style={styles.rolesGrid}>
                {availableRoles.map((role) => {
                  const isAssigned = selectedUser.roles.some((r) => r.idRol === role.idRol);

                  return (
                    <div key={role.idRol} style={styles.roleCard(isAssigned)}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#fff' }}>
                          {role.nombre}
                        </h4>
                      </div>
                      <button
                        style={styles.btnRole(isAssigned)}
                        onClick={() => {
                          if (!isAssigned) {
                            handleAssignRole(selectedUser.idUsuario, role.idRol);
                          }
                        }}
                        disabled={isAssigned}
                      >
                        {isAssigned ? '✓ Asignado' : 'Asignar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}