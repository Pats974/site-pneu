# FullGrip - Site pneus moto

Prototype front-end statique pour un site e-commerce de pneus moto à La Réunion.

## Lancer en local

```bash
python3 -m http.server 5173
```

Puis ouvrir `http://localhost:5173`.

## Mise en ligne

Le dépôt GitHub Pages attendu est:

```text
https://pats974.github.io/site-pneu/
```

Le workflow `.github/workflows/pages.yml` publie automatiquement le site statique à chaque push sur `main`.

## Pages incluses

- Accueil
- Catalogue avec filtres
- Fiche produit
- Panier simulé
- Paiement simulé
- Confirmation
- Demande de devis
- Contact
- FAQ
- Admin stock démo

Les paiements, formulaires et commandes sont simulés côté navigateur.
