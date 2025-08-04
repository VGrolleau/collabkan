import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ma-super-cle-secrete';

const payload = {
    email: 'collab@example.com', // l’email de l’utilisateur que tu veux tester
    // tu peux ajouter d’autres champs si besoin
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

console.log('Token de test:', token);
