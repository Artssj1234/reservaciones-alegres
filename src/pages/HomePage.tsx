
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarRange, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-reserva-dark animate-fade-in">
          Sistema de Reservas Online <br />
          <span className="text-reserva-primary">Simple y Efectivo</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in">
          La forma más fácil para que peluquerías, centros de estética y otros negocios 
          gestionen sus citas online y aumenten su clientela.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in">
          <Link to="/registro">
            <Button className="bg-reserva-primary text-white text-lg px-6 py-6 rounded-md hover:bg-blue-600 transition-colors">
              Solicitar Acceso
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="text-lg px-6 py-6 rounded-md">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-8">
        <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="reserva-card text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <CalendarRange className="h-8 w-8 text-reserva-primary" />
            </div>
            <h3 className="text-xl font-semibold">Gestión de Citas</h3>
            <p className="text-gray-600">
              Administra todas tus citas desde un solo lugar con alertas de nuevas reservas.
            </p>
          </div>
          
          <div className="reserva-card text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Clock className="h-8 w-8 text-reserva-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Horarios Flexibles</h3>
            <p className="text-gray-600">
              Define tus días y horarios de trabajo con total flexibilidad.
            </p>
          </div>
          
          <div className="reserva-card text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              <Users className="h-8 w-8 text-reserva-accent" />
            </div>
            <h3 className="text-xl font-semibold">Clientes Satisfechos</h3>
            <p className="text-gray-600">
              Facilita a tus clientes la reserva de citas sin necesidad de registro.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-8 bg-gray-50 -mx-4 p-8">
        <div className="reserva-container">
          <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 bg-reserva-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Regístrate</h3>
              <p className="text-gray-600 text-sm">
                Solicita acceso a la plataforma con un simple formulario.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 bg-reserva-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Configura</h3>
              <p className="text-gray-600 text-sm">
                Define tus horarios y servicios de forma personalizada.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 bg-reserva-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Comparte</h3>
              <p className="text-gray-600 text-sm">
                Obtén tu enlace único para compartir con clientes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="absolute -top-4 -left-4 bg-reserva-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Recibe citas</h3>
              <p className="text-gray-600 text-sm">
                Tus clientes reservan y tú gestionas todo desde el panel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-8 py-12">
        <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Únete a los cientos de negocios que ya están aprovechando nuestra plataforma para gestionar sus citas.
        </p>
        <Link to="/registro">
          <Button className="bg-reserva-primary text-white text-lg px-8 py-6 rounded-md hover:bg-blue-600 transition-colors">
            Solicitar Acceso Ahora
          </Button>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
