import { tyres as baseTyres } from './data.js'

let tyres = JSON.parse(localStorage.getItem('fg_tyres') || 'null') || baseTyres
let cart = JSON.parse(localStorage.getItem('fg_cart') || '{}')

const app = document.getElementById('app')
const types = ['Roadster', 'Sportive', 'Trail', 'Scooter', 'Custom', 'Touring']
const usages = ['Route', 'Sport', 'Touring', 'Trail', 'Urbain', 'Pluie']

function save() {
  localStorage.setItem('fg_cart', JSON.stringify(cart))
  localStorage.setItem('fg_tyres', JSON.stringify(tyres))
}

function currentRoute() {
  return location.hash.slice(1) || '/'
}

function currentPath() {
  return currentRoute().split('?')[0] || '/'
}

function currentParams() {
  return new URLSearchParams(currentRoute().split('?')[1] || '')
}

function euro(value) {
  return `${Number(value).toFixed(2)} €`
}

function brands() {
  return [...new Set(tyres.map((tyre) => tyre.brand))]
}

function header() {
  const links = [
    ['/', 'Accueil'],
    ['/catalogue', 'Catalogue'],
    ['/devis', 'Devis'],
    ['/contact', 'Contact'],
    ['/faq', 'FAQ'],
    ['/admin', 'Admin Démo'],
    ['/cart', 'Panier'],
  ]

  return `
    <header class="top">
      <div class="logo">FullGrip</div>
      <nav>${links.map(([href, label]) => `<a href="#${href}">${label}</a>`).join('')}</nav>
    </header>
  `
}

function footer() {
  return `
    <footer>
      <p>© FullGrip 2026 - Démo client.</p>
      <p>La Réunion | contact@fullgrip.re | +262 262 00 00 00</p>
    </footer>
  `
}

function productCard(tyre) {
  return `
    <article class="card">
      <h3>${tyre.brand} ${tyre.model}</h3>
      <p>${tyre.dimension} - ${tyre.position}</p>
      <p>
        <strong>${euro(tyre.price)}</strong>
        ${tyre.oldPrice ? `<span class="old">${euro(tyre.oldPrice)}</span>` : ''}
      </p>
      <p>${tyre.available ? 'Disponible' : 'Indisponible'} | Stock: ${tyre.stock}</p>
      <p>${tyre.bikeType} • ${tyre.usage} • ⭐${tyre.rating}</p>
      <span class="badge">${tyre.badge}</span>
      <div class="btns">
        <button onclick="go('/product/${tyre.id}')">Voir détail</button>
        <button onclick="add(${tyre.id})">Ajouter au panier</button>
        <button onclick="go('/devis?product=${tyre.id}')">Demander un devis</button>
      </div>
    </article>
  `
}

function searchBar(target) {
  return `
    <form onsubmit="event.preventDefault(); go('${target}?' + new URLSearchParams(new FormData(this)).toString())">
      <input name="width" placeholder="Largeur">
      <input name="height" placeholder="Hauteur">
      <input name="diameter" placeholder="Diamètre">
      <select name="position">
        <option value="">Position</option>
        <option>Avant</option>
        <option>Arrière</option>
      </select>
      <button>Rechercher</button>
    </form>
  `
}

function selected(value, current) {
  return String(value) === String(current) ? 'selected' : ''
}

function homePage() {
  return `
    <section class="hero">
      <h1>Trouvez vos pneus moto à La Réunion en quelques clics</h1>
      <p>Recherchez par dimension, comparez les modèles et commandez rapidement.</p>
      ${searchBar('/catalogue')}
    </section>

    <section>
      <h2>Pneus populaires</h2>
      <div class="grid">${tyres.slice(0, 6).map(productCard).join('')}</div>
    </section>

    <section>
      <h2>Avantages</h2>
      <ul class="list">
        <li>Stock local</li>
        <li>Devis rapide</li>
        <li>Livraison à La Réunion</li>
        <li>Paiement sécurisé</li>
        <li>Retrait possible</li>
        <li>Conseils pour choisir le bon pneu moto</li>
      </ul>
    </section>

    <section>
      <h2>Comment ça marche ?</h2>
      <ol>
        <li>Choisissez vos dimensions</li>
        <li>Sélectionnez avant, arrière ou train complet</li>
        <li>Comparez les pneus disponibles</li>
        <li>Commandez ou demandez un devis</li>
        <li>Retrait, livraison ou montage partenaire</li>
      </ol>
    </section>

    <section>
      <h2>Avis clients</h2>
      <p>“Service rapide et super conseils” - Lucas D.</p>
    </section>

    <section>
      <h2>Marques</h2>
      <p>Michelin, Pirelli, Bridgestone, Metzeler, Dunlop, Continental</p>
      <a class="cta" href="#/catalogue">Voir le catalogue</a>
    </section>
  `
}

function cataloguePage() {
  const params = currentParams()
  let list = [...tyres]

  for (const key of ['width', 'height', 'diameter', 'position', 'brand', 'bikeType', 'usage']) {
    const value = params.get(key)
    if (value) {
      list = list.filter((tyre) => String(tyre[key]) === value)
    }
  }

  if (params.get('available')) list = list.filter((tyre) => String(tyre.available) === params.get('available'))
  if (params.get('min')) list = list.filter((tyre) => tyre.price >= Number(params.get('min')))
  if (params.get('max')) list = list.filter((tyre) => tyre.price <= Number(params.get('max')))

  const sort = params.get('sort')
  if (sort === 'asc') list.sort((a, b) => a.price - b.price)
  if (sort === 'desc') list.sort((a, b) => b.price - a.price)
  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
  if (sort === 'stock') list.sort((a, b) => b.stock - a.stock)

  return `
    <h1>Catalogue pneus moto</h1>
    ${searchBar('/catalogue')}
    <form oninput="go('/catalogue?' + new URLSearchParams(new FormData(this)).toString())" class="filters">
      <select name="brand">
        <option value="">Marque</option>
        ${brands().map((brand) => `<option ${selected(brand, params.get('brand'))}>${brand}</option>`).join('')}
      </select>
      <input name="min" placeholder="Prix min" value="${params.get('min') || ''}">
      <input name="max" placeholder="Prix max" value="${params.get('max') || ''}">
      <select name="available">
        <option value="">Disponibilité</option>
        <option value="true" ${selected('true', params.get('available'))}>Disponible</option>
        <option value="false" ${selected('false', params.get('available'))}>Indisponible</option>
      </select>
      <select name="bikeType">
        <option value="">Type moto</option>
        ${types.map((type) => `<option ${selected(type, params.get('bikeType'))}>${type}</option>`).join('')}
      </select>
      <select name="usage">
        <option value="">Usage</option>
        ${usages.map((usage) => `<option ${selected(usage, params.get('usage'))}>${usage}</option>`).join('')}
      </select>
      <select name="position">
        <option value="">Position</option>
        <option ${selected('Avant', params.get('position'))}>Avant</option>
        <option ${selected('Arrière', params.get('position'))}>Arrière</option>
      </select>
      <select name="sort">
        <option value="">Tri</option>
        <option value="asc" ${selected('asc', params.get('sort'))}>Prix croissant</option>
        <option value="desc" ${selected('desc', params.get('sort'))}>Prix décroissant</option>
        <option value="rating" ${selected('rating', params.get('sort'))}>Meilleure note</option>
        <option value="stock" ${selected('stock', params.get('sort'))}>Stock disponible</option>
      </select>
    </form>
    <div class="grid">${list.length ? list.map(productCard).join('') : '<p>Aucun produit trouvé.</p>'}</div>
  `
}

function productPage(id) {
  const tyre = tyres.find((item) => item.id === Number(id))
  if (!tyre) return '<p>Produit introuvable.</p>'

  const similar = tyres.filter((item) => item.id !== tyre.id && item.bikeType === tyre.bikeType).slice(0, 3)

  return `
    <h1>${tyre.brand} ${tyre.model}</h1>
    <div class="product">
      <div class="ph">Image produit</div>
      <div>
        <p>${tyre.dimension} - ${tyre.position}</p>
        <p>${euro(tyre.price)}</p>
        <p>${tyre.available ? 'Disponible' : 'Indisponible'} | Stock ${tyre.stock}</p>
        <p>${tyre.description}</p>
        <p>Type: ${tyre.bikeType} | Usage: ${tyre.usage} | Note: ${tyre.rating} (${tyre.reviews} avis)</p>
        <ul>
          <li>Retrait en magasin</li>
          <li>Livraison à domicile</li>
          <li>Montage partenaire bientôt disponible</li>
          <li>Vérifier la dimension exacte sur pneu ou carte grise</li>
        </ul>
        <button onclick="add(${tyre.id})">Ajouter au panier</button>
        <button onclick="go('/devis?product=${tyre.id}')">Demander un devis</button>
      </div>
    </div>
    <h2>Produits similaires</h2>
    <div class="grid">${similar.map(productCard).join('')}</div>
  `
}

function cartPage() {
  const items = Object.entries(cart)
    .map(([id, quantity]) => ({ tyre: tyres.find((item) => item.id === Number(id)), quantity }))
    .filter((item) => item.tyre)

  const subtotal = items.reduce((sum, item) => sum + item.tyre.price * Number(item.quantity), 0)
  const shipping = subtotal ? 15 : 0
  const total = subtotal + shipping

  return `
    <h1>Panier simulé</h1>
    <p class="demo">Démo : aucune commande réelle n'est effectuée.</p>
    ${
      items.length
        ? items.map(({ tyre, quantity }) => `
          <div class="row">
            ${tyre.brand} ${tyre.model} (${tyre.dimension})
            <input type="number" min="1" value="${quantity}" onchange="updateCartQuantity(${tyre.id}, this.value)">
            <button onclick="removeFromCart(${tyre.id})">Supprimer</button>
          </div>
        `).join('')
        : '<p>Panier vide.</p>'
    }
    <p>Sous-total: ${euro(subtotal)}</p>
    <p>Livraison: ${euro(shipping)}</p>
    <p>Total: ${euro(total)}</p>
    <button onclick="go('/checkout')">Continuer vers paiement simulé</button>
    <button onclick="clearCart()">Vider le panier</button>
  `
}

function checkoutPage() {
  return `
    <h1>Paiement simulé</h1>
    <form onsubmit="submitCheckout(event)">
      <input required placeholder="Nom">
      <input required placeholder="Prénom">
      <input required placeholder="Téléphone">
      <input required type="email" placeholder="Email">
      <input required placeholder="Adresse">
      <input required placeholder="Commune">
      <select>
        <option>Retrait en magasin</option>
        <option>Livraison à domicile</option>
        <option>Montage partenaire bientôt disponible</option>
      </select>
      <p class="demo">Prototype : aucune transaction réelle ne sera effectuée.</p>
      <button>Confirmer la commande</button>
    </form>
  `
}

function confirmationPage() {
  const order = JSON.parse(localStorage.getItem('fg_order') || '{}')

  return `
    <h1>Confirmation de commande</h1>
    <p>Commande #FG-${order.order || '00000'}</p>
    <p>Votre demande a bien été enregistrée. Un conseiller vous contactera rapidement.</p>
    <button onclick="go('/')">Retour accueil</button>
    <button onclick="go('/catalogue')">Continuer mes achats</button>
  `
}

function messageForm(title, message) {
  return `
    <h1>${title}</h1>
    <form onsubmit="submitMessage(event, '${message}')">
      <input required placeholder="Nom">
      <input required placeholder="Téléphone">
      <input required type="email" placeholder="Email">
      <textarea placeholder="Commentaire"></textarea>
      <button>Envoyer</button>
    </form>
  `
}

function quotePage() {
  const params = currentParams()
  const productId = params.get('product')
  const tyre = productId ? tyres.find((item) => item.id === Number(productId)) : null

  return `
    <h1>Demande de devis</h1>
    ${tyre ? `<p class="demo">Produit sélectionné : ${tyre.brand} ${tyre.model} - ${tyre.dimension}</p>` : ''}
    <form onsubmit="submitMessage(event, 'Votre devis a été envoyé.')">
      <input required placeholder="Nom">
      <input required placeholder="Téléphone">
      <input required type="email" placeholder="Email">
      <input placeholder="Dimension recherchée" value="${tyre?.dimension || ''}">
      <select>
        <option>Avant</option>
        <option>Arrière</option>
        <option>Train complet</option>
      </select>
      <select>${types.map((type) => `<option>${type}</option>`).join('')}</select>
      <input placeholder="Marque souhaitée" value="${tyre?.brand || ''}">
      <input placeholder="Budget">
      <textarea placeholder="Commentaire"></textarea>
      <button>Envoyer la demande</button>
    </form>
  `
}

function faqPage() {
  const questions = [
    'Comment choisir la bonne dimension de pneu moto ?',
    'Quelle est la différence entre pneu avant et pneu arrière ?',
    'Puis-je commander un train complet ?',
    'Le stock est-il local ?',
    'Puis-je retirer mes pneus ?',
    'Proposez-vous la livraison ?',
    'Le montage est-il inclus ?',
    'Quels moyens de paiement seront disponibles ?',
    'Puis-je demander un devis ?',
    'Le site est-il une démo ?',
  ]

  return `
    <h1>FAQ</h1>
    ${questions.map((question) => `
      <details>
        <summary>${question}</summary>
        <p>Oui, nous vous guidons avec des conseils adaptés à votre moto.</p>
      </details>
    `).join('')}
  `
}

function adminPage() {
  const params = currentParams()
  let list = [...tyres]

  for (const key of ['brand', 'dimension', 'position', 'bikeType']) {
    const value = params.get(key)
    if (value) {
      list = list.filter((tyre) => String(tyre[key]).includes(value))
    }
  }

  const total = tyres.length
  const inStock = tyres.filter((tyre) => tyre.stock > 0).length
  const low = tyres.filter((tyre) => tyre.stock > 0 && tyre.stock < 5).length
  const out = tyres.filter((tyre) => !tyre.available || tyre.stock === 0).length

  return `
    <h1>Admin stock démo</h1>
    <p>Total: ${total} | En stock: ${inStock} | Stock faible: ${low} | Indisponibles: ${out}</p>
    <form oninput="go('/admin?' + new URLSearchParams(new FormData(this)).toString())">
      <input name="brand" placeholder="Marque" value="${params.get('brand') || ''}">
      <input name="dimension" placeholder="Dimension" value="${params.get('dimension') || ''}">
      <select name="position">
        <option value="">Position</option>
        <option ${selected('Avant', params.get('position'))}>Avant</option>
        <option ${selected('Arrière', params.get('position'))}>Arrière</option>
      </select>
      <select name="bikeType">
        <option value="">Type moto</option>
        ${types.map((type) => `<option ${selected(type, params.get('bikeType'))}>${type}</option>`).join('')}
      </select>
    </form>
    <button onclick="addDemoProduct()">Ajouter produit fictif</button>
    ${list.map((tyre) => `
      <div class="row">
        #${tyre.id} ${tyre.brand} ${tyre.model}
        <input type="number" value="${tyre.price}" onchange="updateProduct(${tyre.id}, 'price', Number(this.value))">
        <input type="number" value="${tyre.stock}" onchange="updateProduct(${tyre.id}, 'stock', Number(this.value))">
        <select onchange="updateProduct(${tyre.id}, 'available', this.value === 'true')">
          <option value="true" ${tyre.available ? 'selected' : ''}>Disponible</option>
          <option value="false" ${!tyre.available ? 'selected' : ''}>Indisponible</option>
        </select>
        <button onclick="deleteProduct(${tyre.id})">Supprimer</button>
      </div>
    `).join('')}
  `
}

function contactPage() {
  return `
    ${messageForm('Contact', 'Message envoyé. Un conseiller vous aide à trouver le bon pneu moto.')}
    <p>Zone: La Réunion | Horaires: Lun-Sam 8h-18h | Pensez à vérifier les dimensions exactes inscrites sur vos pneus actuels.</p>
  `
}

function render() {
  const route = currentRoute()
  const path = currentPath()

  let html = ''

  if (path.startsWith('/product/')) {
    html = productPage(path.split('/')[2])
  } else {
    const pages = {
      '/': homePage,
      '/catalogue': cataloguePage,
      '/cart': cartPage,
      '/checkout': checkoutPage,
      '/confirmation': confirmationPage,
      '/devis': quotePage,
      '/contact': contactPage,
      '/faq': faqPage,
      '/admin': adminPage,
    }

    html = (pages[path] || pages['/'])(route)
  }

  app.innerHTML = `${header()}<main>${html}</main>${footer()}`
}

window.go = (path) => {
  location.hash = `#${path || '/'}`
}

window.add = (id) => {
  cart[id] = (cart[id] || 0) + 1
  save()
  alert('Ajouté au panier')
  render()
}

window.updateCartQuantity = (id, quantity) => {
  cart[id] = Math.max(1, Number(quantity) || 1)
  save()
  render()
}

window.removeFromCart = (id) => {
  delete cart[id]
  save()
  render()
}

window.clearCart = () => {
  cart = {}
  save()
  render()
}

window.submitCheckout = (event) => {
  event.preventDefault()
  const order = Math.floor(Math.random() * 90000 + 10000)
  localStorage.setItem('fg_order', JSON.stringify({ order, cart }))
  cart = {}
  save()
  window.go('/confirmation')
}

window.submitMessage = (event, message) => {
  event.preventDefault()
  event.currentTarget.outerHTML = `<p>${message}</p>`
}

window.updateProduct = (id, key, value) => {
  const tyre = tyres.find((item) => item.id === id)
  if (!tyre) return
  tyre[key] = value
  save()
  render()
}

window.deleteProduct = (id) => {
  tyres = tyres.filter((tyre) => tyre.id !== id)
  delete cart[id]
  save()
  render()
}

window.addDemoProduct = () => {
  const id = Math.max(...tyres.map((tyre) => tyre.id)) + 1
  tyres.push({
    id,
    brand: 'Demo',
    model: 'Nouveau',
    width: 120,
    height: 70,
    diameter: 'R17',
    dimension: '120/70 R17',
    position: 'Avant',
    price: 99,
    stock: 10,
    available: true,
    bikeType: 'Roadster',
    usage: 'Route',
    rating: 4.0,
    reviews: 0,
    badge: 'Promo',
    description: 'Produit fictif',
  })
  save()
  render()
}

window.addEventListener('hashchange', render)
render()
