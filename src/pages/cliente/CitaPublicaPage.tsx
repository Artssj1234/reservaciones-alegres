import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Servicio, HorarioDisponible, DiaDisponible } from "@/types";

interface Props {
  negocioId: string;
}

const CitaPublicaPage = ({ negocioId }: Props) => {
  const { toast } = useToast();

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioId, setServicioId] = useState<string>("");
  const [fecha, setFecha] = useState<Date>(new Date());
  const [diasDisponibles, setDiasDisponibles] = useState<DiaDisponible[]>([]);
  const [horasDisponibles, setHorasDisponibles] = useState<HorarioDisponible[]>([]);

  useEffect(() => {
    if (negocioId) {
      obtenerServicios();
    }
  }, [negocioId]);

  useEffect(() => {
    if (negocioId && servicioId) {
      cargarDiasDisponibles(fecha.getFullYear(), fecha.getMonth() + 1);
    }
  }, [negocioId, servicioId]);

  useEffect(() => {
    if (negocioId && servicioId && fecha) {
      getHorariosDisponibles();
    }
  }, [fecha, servicioId]);

  const obtenerServicios = async () => {
    const { data, error } = await supabase
      .from("servicios")
      .select("*")
      .eq("negocio_id", negocioId);

    if (error) {
      toast({ title: "Error al cargar servicios", description: error.message });
    } else {
      setServicios(data);
    }
  };

  const cargarDiasDisponibles = async (anio: number, mes: number) => {
    const { data, error } = await supabase.rpc("obtener_dias_disponibles_mes", {
      p_negocio_id: negocioId,
      p_anio: anio,
      p_mes: mes,
      p_servicio_id: servicioId
    });

    if (error) {
      toast({ title: "Error al cargar disponibilidad", description: error.message });
    } else {
      setDiasDisponibles(data);
    }
  };

  const getHorariosDisponibles = async () => {
    const { data, error } = await supabase.rpc("obtener_horarios_disponibles", {
      p_negocio_id: negocioId,
      p_fecha: fecha.toISOString().split("T")[0],
      p_servicio_id: servicioId // ✅ Solo este, NO p_duracion_minutos
    });

    if (error) {
      toast({ title: "Error al obtener horarios", description: error.message });
    } else {
      setHorasDisponibles(data);
    }
  };

  return (
    <div>
      <h1>Reservar cita</h1>

      <select value={servicioId} onChange={(e) => setServicioId(e.target.value)}>
        <option value="">Selecciona un servicio</option>
        {servicios.map((servicio) => (
          <option key={servicio.id} value={servicio.id}>
            {servicio.nombre}
          </option>
        ))}
      </select>

      {/* Aquí podrías agregar un calendario con los días disponibles */}
      <p>Días disponibles: {diasDisponibles.length}</p>
      <ul>
        {horasDisponibles.map((hora, i) => (
          <li key={i}>
            {hora.hora_inicio} - {hora.hora_fin}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CitaPublicaPage;
