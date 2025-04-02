
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CalendarClock, CalendarCheck, ClipboardList, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sistema de Reservas Online para Tu Negocio
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Administra tus citas, servicios y horarios de forma sencilla. Permite que tus clientes reserven online 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/registro">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                  Registrar Mi Negocio
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full text-indigo-600">
                <CalendarClock size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestión de Horarios</h3>
              <p className="text-gray-600">Define tus horarios de trabajo y días disponibles para las citas.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full text-indigo-600">
                <ClipboardList size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Catálogo de Servicios</h3>
              <p className="text-gray-600">Crea y administra tu catálogo de servicios con precios y duración.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full text-indigo-600">
                <CalendarCheck size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gestión de Citas</h3>
              <p className="text-gray-600">Consulta, confirma o cancela citas fácilmente desde un solo lugar.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-indigo-100 rounded-full text-indigo-600">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reservas Online</h3>
              <p className="text-gray-600">Tus clientes pueden reservar citas online en cualquier momento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para optimizar tu negocio?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Únete a los miles de negocios que ya gestionan sus reservas de forma eficiente.
          </p>
          <Link to="/registro">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
