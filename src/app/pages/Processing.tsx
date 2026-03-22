import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

export function Processing() {
  const navigate = useNavigate();
  const location = useLocation();
  const photoData = location.state?.photoData;

  useEffect(() => {
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      navigate('/item/new', { 
        state: { 
          photoData,
          // Mock AI-generated data
          aiData: {
            name: 'Oppvaskkum',
            category: 'Kjøkkenutstyr',
            estimatedValue: 150,
            condition: 'God',
          }
        } 
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, photoData]);

  if (!photoData) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Photo Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-64 h-64 rounded-2xl overflow-hidden mb-8 shadow-lg"
      >
        <img
          src={photoData}
          alt="Captured item"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Analyserer bildet...</p>
      </motion.div>
    </div>
  );
}