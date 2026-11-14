import { Link } from 'react-router-dom';
import { CheckCircle2, Flame, Plus } from 'lucide-react';
import type { ProgresoSemanal as Progreso } from '../api/metasApi';
import type { Estado } from '../api/videojuegosApi';
import {
  formatearFechaCalendario,
  formatearHoras,
} from '../utils/formato';
import {
  botonPrimarioE2,
  etiquetaDatoE2,
  textoAuxiliarE2,
} from '../utils/estilosE2';
import { BarraProgreso } from './BarraProgreso';
import { EstadoSeccion } from './EstadoSeccion';
import { ListaHitos } from './ListaHitos';

interface Props {
  progreso: Progreso;
  estado: Estado;
}

function textoDias(n: number): string {
  return n === 1 ? '1 día' : `${n} días`;
}

function textoRacha(actual: number): string {
  if (actual <= 0) return 'Retoma cuando quieras: tu racha empieza hoy';
  return actual === 1
    ? 'Llevas 1 día seguido, ¡buen ritmo!'
    : `Llevas ${actual} días seguidos, ¡buen ritmo!`;
}

export function ProgresoSemanal({ progreso, estado }: Props) {
  const { meta, racha } = progreso;
  const enCurso = estado !== 'completado' && estado !== 'abandonado';
  // El servidor devuelve mejor racha 0 solo cuando el videojuego no tiene partidas.
  const sinPartidas = racha.mejor === 0;

  const avisoSinPartidas = sinPartidas && (
    <EstadoSeccion
      tipo="vacio"
      titulo="Aún no tienes partidas: registra la primera"
      acciones={
        <Link
          to={`/partidas/nueva?videojuego=${progreso.videojuego}`}
          className={botonPrimarioE2}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Registrar partida
        </Link>
      }
    />
  );

  const bloqueRacha = (
    <div className="rounded-lg border border-borde p-4">
      <p className={`${etiquetaDatoE2} mb-2 flex items-center gap-2`}>
        <Flame className="h-4 w-4 text-acento" aria-hidden="true" />
        Tu racha actual
      </p>
      <p className="text-base text-texto">{textoRacha(racha.actual)}</p>
      <p className={`${textoAuxiliarE2} mt-1`}>
        Tu mejor racha: {textoDias(racha.mejor)}
      </p>
    </div>
  );

  if (!meta) {
    return (
      <div className="space-y-5">
        {enCurso ? (
          <EstadoSeccion
            tipo="vacio"
            titulo="Aún no tienes una meta semanal para este videojuego"
            texto="Define una para ver tus horas y días de cada semana."
          />
        ) : (
          <EstadoSeccion
            tipo="vacio"
            titulo="Este videojuego ya no está en curso, así que no puede tener una meta semanal."
          />
        )}
        {avisoSinPartidas}
        {bloqueRacha}
      </div>
    );
  }

  // RN-05: el texto muestra el valor real; solo el relleno de la barra se limita a 100 %.
  const porcentajeHoras = Math.min(100, progreso.porcentajeHoras ?? 0);
  const proporcionDias = Math.min(
    100,
    (progreso.diasJugados / meta.diasSemana) * 100
  );
  const horasFaltan = Math.max(0, meta.horasSemana - progreso.horasJugadas);
  const diasFaltan = Math.max(0, meta.diasSemana - progreso.diasJugados);
  const cumplida = progreso.cumplida === true;

  const textoHoras = `${formatearHoras(progreso.horasJugadas)} de ${formatearHoras(meta.horasSemana)}`;
  const textoDiasValor = `${progreso.diasJugados} de ${textoDias(meta.diasSemana)}`;

  return (
    <div className="space-y-5">
      <p className={textoAuxiliarE2}>
        Semana del {formatearFechaCalendario(progreso.semana.inicio)} al{' '}
        {formatearFechaCalendario(progreso.semana.fin)} · Hoy es{' '}
        {formatearFechaCalendario(progreso.hoy)}
      </p>

      {cumplida && (
        <p className="flex items-center gap-2 font-semibold text-exito">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ¡Meta cumplida!
        </p>
      )}

      <div className="space-y-2">
        <BarraProgreso
          etiqueta="Horas"
          porcentaje={porcentajeHoras}
          textoValor={textoHoras}
          textoAccesible={`${textoHoras} esta semana`}
          completa={cumplida}
        />
        {horasFaltan > 0 && (
          <p className={textoAuxiliarE2}>
            Te faltan {formatearHoras(horasFaltan)} para tu meta
          </p>
        )}
      </div>

      <div className="space-y-2">
        <BarraProgreso
          etiqueta="Días"
          porcentaje={proporcionDias}
          textoValor={textoDiasValor}
          textoAccesible={`${textoDiasValor} esta semana`}
          completa={cumplida}
        />
        {diasFaltan > 0 && (
          <p className={textoAuxiliarE2}>
            {diasFaltan === 1
              ? 'Te falta 1 día para completar tu meta'
              : `Te faltan ${diasFaltan} días para completar tu meta`}
          </p>
        )}
      </div>

      {avisoSinPartidas}

      {bloqueRacha}

      <ListaHitos hitos={progreso.hitos} avanceActual={progreso.avanceActual} />
    </div>
  );
}
