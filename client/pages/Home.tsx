import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, BookOpen, QrCode, UtensilsCrossed, Clock, MapPin, Phone } from 'lucide-react';

export default function Home() {
  
  const cartaUrl = `${window.location.origin}/carta`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(cartaUrl)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      <div className="relative overflow-hidden min-h-[90vh] flex items-center">
        
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80" 
            alt="Restaurant Abocado" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="text-center">
            
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border-2 border-white/20">
                <ChefHat className="w-14 h-14 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
              Restaurant <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Abocado</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white mb-4 max-w-3xl mx-auto drop-shadow-lg font-semibold">
              Sabores auténticos que despiertan tus sentidos
            </p>
            
            <p className="text-lg text-slate-200 mb-12 max-w-2xl mx-auto drop-shadow-md">
              Disfruta de una experiencia culinaria única con nuestros platos preparados con ingredientes frescos y recetas tradicionales. 
              Cada bocado es una celebración del sabor peruano.
            </p>

            
            <Link to="/carta">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <BookOpen className="w-6 h-6 mr-2" />
                Ver Nuestra Carta
              </Button>
            </Link>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Nuestros Platos Estrella
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="relative group overflow-hidden rounded-2xl aspect-square shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80" 
              alt="Pollo a la Brasa" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pollo a la Brasa</h3>
                <p className="text-slate-200">Nuestro plato estrella, dorado y crujiente</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-orange-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-bold text-sm">⭐ Estrella</p>
            </div>
          </div>

          
          <div className="relative group overflow-hidden rounded-2xl aspect-square shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80" 
              alt="Platos Principales" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Platos Principales</h3>
                <p className="text-slate-200">Variedad de sabores para todos los gustos</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-bold text-sm">🍽️ Variedad</p>
            </div>
          </div>

          
          <div className="relative group overflow-hidden rounded-2xl aspect-square shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80" 
              alt="Postres Deliciosos" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Postres Deliciosos</h3>
                <p className="text-slate-200">El toque dulce perfecto para terminar</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-pink-600/90 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-bold text-sm">🍰 Postres</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-slate-800/50 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-3 mb-6">
                <QrCode className="w-8 h-8 text-orange-500" />
                <h2 className="text-3xl font-bold text-white">Escanea y Ve Nuestra Carta</h2>
              </div>
              <p className="text-slate-400 mb-8 text-lg">
                Escanea el código QR con tu celular para acceder directamente a nuestra carta digital. 
                Sin necesidad de descargar nada, todo al alcance de un clic.
              </p>
              
              <div className="flex justify-center md:justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code Carta" 
                    className="w-48 h-48"
                  />
                </div>
              </div>
            </div>

            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Información del Restaurante</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-600/20 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Horarios</h4>
                      <p className="text-slate-400">Lunes - Domingo: 12:00 PM - 11:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-orange-600/20 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Ubicación</h4>
                      <p className="text-slate-400">Ayacucho, Huamanga, Perú</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-orange-600/20 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Contacto</h4>
                      <p className="text-slate-400">+51 999 999 999</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link to="/login">
                  <Button
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UtensilsCrossed className="w-5 h-5 mr-2" />
                    Acceso Personal de Trabajo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <footer className="bg-slate-950 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 Restaurant Abocado - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  );
}

