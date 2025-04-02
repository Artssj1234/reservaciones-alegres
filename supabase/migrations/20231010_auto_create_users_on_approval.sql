
-- Create a function to automatically create users and businesses when a request is approved
CREATE OR REPLACE FUNCTION public.handle_solicitud_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'aceptado'
  IF NEW.estado = 'aceptado' AND (OLD.estado != 'aceptado' OR OLD.estado IS NULL) THEN
    -- First check if credentials are provided
    IF NEW.usuario IS NULL OR NEW.contrasena IS NULL THEN
      RAISE EXCEPTION 'No se pueden crear las credenciales: falta usuario o contraseña';
    END IF;
    
    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE usuario = NEW.usuario) THEN
      RAISE EXCEPTION 'El nombre de usuario ya está en uso';
    END IF;
    
    -- Insert the new user
    INSERT INTO public.usuarios (rol, usuario, contrasena)
    VALUES ('negocio', NEW.usuario, NEW.contrasena)
    RETURNING id INTO NEW.usuario_id;
    
    -- Insert the business record
    INSERT INTO public.negocios (nombre, slug, usuario_id)
    VALUES (NEW.nombre_negocio, NEW.slug, NEW.usuario_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_solicitud_approval ON public.solicitudes_negocio;
CREATE TRIGGER on_solicitud_approval
  AFTER UPDATE ON public.solicitudes_negocio
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_solicitud_approval();

-- Add usuario_id column to solicitudes_negocio if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'solicitudes_negocio' 
    AND column_name = 'usuario_id'
  ) THEN
    ALTER TABLE public.solicitudes_negocio ADD COLUMN usuario_id UUID;
  END IF;
END $$;
