'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Master from '@components/Layout/Master';
import Section from '@components/Section/Section';
import Heading from '@components/Heading/Heading';
import ButtonLink from '@components/Button/ButtonLink';
import { useUser } from '@contexts/UserContext';

type RoleLike = { id?: number; nombre?: string; name?: string; codigo?: string; slug?: string };

const organizerKeywords = ['organizador', 'organizer'];

const resolveRoleName = (role: RoleLike | string) => {
  if (typeof role === 'string') return role.toLowerCase();
  return String(role?.nombre ?? role?.name ?? role?.codigo ?? role?.slug ?? '').toLowerCase();
};

const hasOrganizerRole = (roles: Array<RoleLike | string>) =>
  roles.some((role) => organizerKeywords.includes(resolveRoleName(role)));

const extractRolesFromUser = (user: any) => {
  if (!user) return [] as Array<RoleLike | string>;
  if (Array.isArray(user.roles)) return user.roles;
  if (Array.isArray(user.Roles)) return user.Roles;
  if (Array.isArray(user.rolesAsignados)) return user.rolesAsignados;
  if (Array.isArray(user.perfiles)) return user.perfiles;
  return [] as Array<RoleLike | string>;
};

const userIsOrganizer = (user: any) => {
  if (!user) return false;

  const directFlags = [
    user?.rol,
    user?.role,
    user?.tipoUsuario,
    user?.tipo_usuario,
    user?.perfil,
    user?.tipo,
  ].filter(Boolean);

  if (
    directFlags.some(
      (flag) => typeof flag === 'string' && organizerKeywords.includes(flag.toLowerCase())
    )
  ) {
    return true;
  }

  const roles = extractRolesFromUser(user);
  return roles.length > 0 ? hasOrganizerRole(roles) : false;
};

const OrganizerGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useUser();
  const [checkingRoles, setCheckingRoles] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const organizerFromUser = useMemo(() => userIsOrganizer(user), [user]);

  useEffect(() => {
    const validateRole = async () => {
      if (loading) return;

      if (!user) {
        setHasAccess(false);
        router.replace('/members/signin?reason=organizer');
        return;
      }

      if (organizerFromUser) {
        setHasAccess(true);
        return;
      }

      const token = localStorage.getItem('auth_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8098';
      const userId =
        (user as any).idUsuario ?? (user as any).id ?? (user as any).usuarioId ?? (user as any).userId;

      if (!token || !userId) {
        setHasAccess(false);
        return;
      }

      setCheckingRoles(true);
      try {
        const response = await fetch(`${apiBase}/api/users/${userId}/roles`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const payload = await response.json();
          const roles =
            (Array.isArray(payload?.roles) && payload.roles) || (Array.isArray(payload) && payload) || [];
          const allowed = hasOrganizerRole(roles);
          setHasAccess(allowed);
          if (!allowed) {
            router.replace('/members/signin?reason=organizer');
          }
          return;
        }

        setHasAccess(false);
      } catch (error) {
        console.error('Organizer role validation failed', error);
        setHasAccess(false);
      } finally {
        setCheckingRoles(false);
      }
    };

    void validateRole();
  }, [loading, user, router, organizerFromUser]);

  if (loading || checkingRoles || hasAccess === null) {
    return (
      <Master>
        <Section className='gray-background hero-offset'>
          <div className='container'>
            <Heading type={3} color='white' text='Validando permisos de organizador...' />
            <p className='gray'>Estamos verificando tu rol, por favor espera un momento.</p>
          </div>
        </Section>
      </Master>
    );
  }

  if (!hasAccess) {
    return (
      <Master>
        <Section className='gray-background hero-offset'>
          <div className='container'>
            <Heading type={2} color='white' text='Acceso solo para organizadores' />
            <p className='gray'>
              Tu cuenta no tiene el rol de organizador. Inicia sesion con un perfil autorizado o
              solicita acceso al equipo.
            </p>
            <div className='organizer-cta-row'>
              <ButtonLink color='yellow-filled' text='Iniciar sesion' rightIcon='login' url='/members/signin' />
              <ButtonLink color='gray-overlay' text='Volver al inicio' rightIcon='home' url='/' />
            </div>
          </div>
        </Section>
      </Master>
    );
  }

  return <>{children}</>;
};

export default OrganizerGuard;
