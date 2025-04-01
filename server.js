const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');


// Configuration de PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'InventoryManager',
  password: 'djibril21',
  port: 5432,
});

const app = express();
const port = 5000;
app.use(cors());

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint pour récupérer les dépenses depuis PostgreSQL
// Endpoint pour récupérer les dépenses depuis PostgreSQL

app.post('/api/items', async (req, res) => {
    try {
      const { 
        product_name, 
        description, 
        category, 
        qty, 
        min_qty, 
        price, 
        cost, 
        purchase_date 
      } = req.body;
      
      const result = await pool.query(
        `INSERT INTO items 
         (product_name, description, category, qty, min_qty, price, cost, purchase_date, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [product_name, description, category, qty, min_qty, price, cost, purchase_date]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Erreur lors de l\'ajout d\'un article:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  
  // Mettre à jour un article existant
  app.put('/api/items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        product_name, 
        description, 
        category, 
        qty, 
        min_qty, 
        price, 
        cost, 
        purchase_date 
      } = req.body;
      
      const result = await pool.query(
        `UPDATE items 
         SET product_name = $1, 
             description = $2, 
             category = $3, 
             qty = $4, 
             min_qty = $5, 
             price = $6, 
             cost = $7, 
             purchase_date = $8, 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [product_name, description, category, qty, min_qty, price, cost, purchase_date, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur lors de la modification d\'un article:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  
  // Supprimer un article
  app.delete('/api/items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        'DELETE FROM items WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Article non trouvé' });
      }
      
      res.json({ message: 'Article supprimé avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression d\'un article:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });

app.get('/api/items', async (req, res) => {
    try {
      // Exécuter la requête pour récupérer tous les articles
      const result = await pool.query(`
        SELECT 
          id,
          product_name,
          description,
          category,
          qty,
          min_qty,
          price,
          cost,
          purchase_date,
          created_at,
          updated_at
        FROM items
        ORDER BY product_name
      `);
      
      // Renvoyer les résultats au format JSON
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
// Ajouter une dépense
app.post('/api/expenses', async (req, res) => {
  try {
    const { name, category, amount, expense_date, recurring, recurring_period, notes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO expenses 
       (name, category, amount, expense_date, recurring, recurring_period, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [name, category, amount, expense_date, recurring, recurring_period, notes]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une dépense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre à jour une dépense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, amount, expense_date, recurring, recurring_period, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE expenses 
       SET name = $1, 
           category = $2, 
           amount = $3, 
           expense_date = $4, 
           recurring = $5, 
           recurring_period = $6, 
           notes = $7
       WHERE id = $8
       RETURNING *`,
      [name, category, amount, expense_date, recurring, recurring_period, notes, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur lors de la modification d\'une dépense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Supprimer une dépense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Dépense non trouvée' });
    }
    
    res.json({ message: 'Dépense supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une dépense:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/expenses', async (req, res) => {
    try {
      // Exécuter la requête pour récupérer toutes les dépenses
      const result = await pool.query(`
        SELECT 
          id,
          name,
          category,
          amount,
          expense_date,
          recurring,
          recurring_period,
          notes,
          created_at
        FROM expenses
        ORDER BY expense_date DESC
      `);
      
      // Renvoyer les résultats au format JSON
      res.json(result.rows);
    } catch (error) {
      console.error('Erreur lors de la récupération des dépenses:', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
  
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});

// Dans server.js
// Dans server/server.js ou une route dédiée
app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Vérifier si l'utilisateur existe dans la base de données
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1', 
        [email]
      );
      
      // Si aucun utilisateur n'est trouvé
      if (result.rows.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        });
      }
      
      const user = result.rows[0];
      
      // En production, vous devriez utiliser bcrypt pour comparer les mots de passe hachés
      // Mais pour cet exemple, nous comparons directement (non recommandé en production)
      if (password !== user.password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        });
      }
      
      // Authentification réussie
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email
          // N'incluez pas le mot de passe dans la réponse!
        }
      });
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur' 
      });
    }
  });

// Dans votre fichier server.js


  