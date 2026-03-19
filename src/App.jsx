import { useState, useMemo, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";

const responsiveStyles = `
  .pap-header { padding: 12px 28px; display: flex; align-items: center; gap: 18px; flex-wrap: nowrap; }
  .pap-header-title { display: block; }
  .pap-header-controls { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; }
  .pap-header-select { min-width: 230px; padding: 8px 34px 8px 12px; font-size: 12px; }
  .pap-header-btn-text { display: inline; }
  .pap-tabs button { padding: 12px 20px; flex-direction: row; font-size: 12px; }
  .pap-tabs .tab-icon { font-size: 14px; }
  .pap-content { padding: 24px 28px; }
  .pap-card-inner { padding: 20px 24px; }

  .commande-layout { display: flex; gap: 20px; }
  .commande-products { flex: 1; min-width: 0; }
  .commande-cart { min-width: 270px; max-width: 300px; position: sticky; top: 20px; align-self: flex-start; }
  .commande-cart-mobile-bar { display: none; }

  @media (max-width: 700px) {
    .pap-header { flex-wrap: wrap; padding: 10px 12px; gap: 8px; }
    .pap-header-title { flex: 1; min-width: 0; }
    .pap-header-title h1 { font-size: 15px !important; }
    .pap-header-title p { font-size: 9px !important; }
    .pap-header-controls { margin-left: 0; width: 100%; justify-content: flex-end; flex-wrap: wrap; gap: 6px; }
    .pap-header-select { width: 100%; min-width: unset; font-size: 13px; padding: 9px 12px; box-sizing: border-box; }
    .pap-header-btn-text { display: none; }
    .pap-tabs button { padding: 9px 4px; flex-direction: column; font-size: 10px; gap: 2px !important; flex: 1; }
    .pap-tabs .tab-icon { font-size: 20px; }
    .pap-content { padding: 10px 8px; }
    .pap-card-inner { padding: 14px 12px; }

    .commande-layout { flex-direction: column; gap: 0; padding-bottom: 80px; }
    .commande-cart { display: none; }
    .commande-cart-mobile-bar {
      display: flex;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
      background: #2C1810; color: #fff;
      padding: 12px 16px; align-items: center; justify-content: space-between;
      box-shadow: 0 -4px 20px rgba(0,0,0,.25);
    }
  }
`;

function StyleTag() {
  return <style>{responsiveStyles}</style>;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const BOULANGERIES = [
  { id: 1, name: "Pense Au Pain Cholet Boulange",   color: "#8B4513" },
  { id: 2, name: "Pense Au Pain Cholet Sacré Coeur", color: "#A0522D" },
  { id: 3, name: "Pense Au Pain Jard",               color: "#6B3A2A" },
  { id: 4, name: "Pense Au Pain La Ferrière",        color: "#704214" },
  { id: 5, name: "La Pause Cholet",                  color: "#9B6B47" },
];

const ALL_PRODUCTS = [
  { ref: 'FRU15', name: 'Abricot 1/2 pelé sirop 5/1', unit: '1', prix_ht: 9.88, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'FRU16', name: 'Abricot Cube 5/5mms 4kg', unit: '1', prix_ht: 8.34, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'FRU14', name: 'Abricot Sirop 3/1', unit: '1', prix_ht: 5.86, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Richard Distribution' },
  { ref: 'FRU13', name: 'Abricot sirop 5/1', unit: '1', prix_ht: 9.75, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Richard Distribution' },
  { ref: 'PATISS37', name: 'Acide citrique poudre L.François 1kG', unit: '1', prix_ht: 12.44, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'DIV082', name: 'Agent Démoulage Aerosol 500mL', unit: '1', prix_ht: 2.75, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'CHA18', name: 'Aiguillette poulet panée 1kG', unit: '1', prix_ht: 7.24, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'CHA09', name: 'Aiguillettes P.Pané CORNFLAKES 1kG', unit: '1', prix_ht: 7.30, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'SNA19', name: 'Ail surgelé 4kg', unit: '4', prix_ht: 17.20, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'FRO17', name: 'Ail/fine herbe 500g', unit: '1', prix_ht: 4.48, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'PATISS14', name: 'Amande entière 1kg', unit: '1', prix_ht: 6.90, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS12', name: 'Amande hachée 1kG', unit: '1', prix_ht: 7.51, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS13', name: 'Amande hachée 5kG', unit: '1', prix_ht: 6.25, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'FRU03', name: 'Amande poudre blanche 10kg', unit: '10', prix_ht: 5.24, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: '', name: 'Amande poudre grise 10kg', unit: '10', prix_ht: 5.31, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS11', name: 'Amandes effilée 5kG', unit: '1', prix_ht: 5.15, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'FRU17', name: 'Amandes emondées 1kG', unit: '1', prix_ht: 6.89, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'PATISS15', name: 'Amandes poudre grise', unit: '10kg', prix_ht: 5.31, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'FAR02', name: 'Améliorant Ibis Violet 10kg', unit: '1', prix_ht: 6.83, tva: 0.055, cat: 'Farines & Levains', four: 'BackEurop THOMAS' },
  { ref: 'PATISS28', name: 'Amidon Mais Seau 5kG', unit: '1', prix_ht: 2.41, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'FRU19', name: 'Ananas Morceaux cube 1kG', unit: '1', prix_ht: 4.77, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'PATISS73', name: 'Arome Café Brésilien 1L SEBALSE', unit: '1', prix_ht: 17.90, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Arôme Chocolat', unit: '1', prix_ht: 11.00, tva: 0.055, cat: 'Divers', four: '' },
  { ref: 'PATISS74', name: 'Arome Vanille Boulpat 1L SEBALSE', unit: '1', prix_ht: 8.20, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'DIV092', name: 'Assiette Sav ronde noire 88mns', unit: '100', prix_ht: 0.08, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'CHA10', name: 'Bacon tranche 1kG', unit: '1', prix_ht: 10.60, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'LEG006', name: 'Banane', unit: '1', prix_ht: 1.50, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'PATISS22', name: 'Bâton chocolat 36cm 5kG', unit: '500', prix_ht: 8.25, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'CREM19', name: 'Beurre 1/2 SEL VROUGE 80% 500g', unit: '1', prix_ht: 4.63, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'CREM14', name: 'Beurre 82% Motte 10kG', unit: '1', prix_ht: 8.30, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'CREM15', name: 'Beurre 82% Motte 25kG', unit: '1', prix_ht: 4.80, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'CREM16', name: 'Beurre Demi Sel 1kG', unit: '1', prix_ht: 7.34, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'CREM17', name: 'Beurre Tourage 10kG', unit: '1', prix_ht: 9.10, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TransGourmet' },
  { ref: 'BOISS32', name: 'Bière Heineken 33cL', unit: '24', prix_ht: 0.65, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'FRU25', name: 'Bigarreaux Sirop 4/4', unit: '1', prix_ht: 2.18, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'OEU02', name: 'Blanc Œuf Liquide 1kG', unit: '1', prix_ht: 3.29, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'FRO05', name: 'Bleu cube 1,3kg', unit: '1', prix_ht: 13.65, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'DIV087', name: 'Bobine Papier 450 feuilles', unit: '450', prix_ht: 2.53, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV044', name: 'Boîte Burger', unit: '50', prix_ht: 7.49, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Bougies diverses', unit: '10', prix_ht: 6.70, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FRO07', name: 'Brie kG', unit: '1', prix_ht: 9.09, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'PATISS80', name: 'Brisure de daim', unit: '1', prix_ht: 25.90, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Brisure M&M\'s', unit: '1', prix_ht: 17.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS66', name: 'Cacahuète grilléees non salé 1kg', unit: '1', prix_ht: 3.95, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS71', name: 'Cacao Poudre 3kg', unit: '1', prix_ht: 19.30, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'DIV033', name: 'Café Trablit bouteille 1L', unit: '1', prix_ht: 26.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV032', name: 'Café moulu Tradition 1kG', unit: '1', prix_ht: 16.88, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV020', name: 'Caiss calypso fond brun', unit: '1000', prix_ht: 42.80, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV043', name: 'Cagette carton', unit: '50', prix_ht: 32.58, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Caissette Calypso Fond Brun 88', unit: '1', prix_ht: 0.02, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV021', name: 'Caiss calypso fond noir', unit: '1000', prix_ht: 16.62, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV042', name: 'Caiss Fond tarte 1553 D.190*30', unit: '1000', prix_ht: 74.46, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Caissette Ronde 1201F70', unit: '1000', prix_ht: 0.01, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV045', name: 'Caissette papier Archeduc', unit: '50', prix_ht: 4.39, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV022', name: 'Caissette pâtissière blanche 14', unit: '100', prix_ht: 3.79, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV023', name: 'Caissette pâtissière blanche 16', unit: '100', prix_ht: 4.29, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV024', name: 'Caissette pâtissière blanche 18', unit: '100', prix_ht: 4.49, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV025', name: 'Caissette pâtissière blanche 20', unit: '100', prix_ht: 5.15, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: '', name: 'Caissette savarin baba', unit: '1', prix_ht: 42.64, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV061', name: 'Caissette Tulipcup marron 150/50', unit: '200', prix_ht: 0.04, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: '', name: 'Camembert', unit: '0.24', prix_ht: 1.73, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Capre capucine au vinaigre', unit: '1', prix_ht: 4.40, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'BOISS33', name: 'Capri-Sul multi vitaminé 20cL', unit: '40', prix_ht: 0.38, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'DIV034', name: 'Cartouche Gaz 360mL', unit: '1', prix_ht: 2.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'LEG017', name: 'Carotte sac', unit: '1', prix_ht: 1.20, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'DIV029', name: 'Carré Noir / Or 16x16', unit: '50', prix_ht: 4.55, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV030', name: 'Carré Noir / Or 20x20', unit: '50', prix_ht: 6.29, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV026', name: 'Carré rainé 13cm', unit: '250', prix_ht: 3.39, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV027', name: 'Carré rainé 15cm', unit: '250', prix_ht: 3.85, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV028', name: 'Carré rainé 17cm', unit: '250', prix_ht: 5.39, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'PATISS65', name: 'Cerneaux invalides arlequins 10kg', unit: '1', prix_ht: 5.09, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'CHA25', name: 'Champignon Hotel 5/1 BROVER', unit: '1', prix_ht: 9.80, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'FRO06', name: 'Cheddar (84 tranches)', unit: '1', prix_ht: 8.96, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: '', name: 'Cheddar rouge', unit: '1', prix_ht: 7.68, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FRO13', name: 'Chèvre Tranche 42mm 1,3kG', unit: '1', prix_ht: 12.69, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'PATISS36', name: 'Chocopat seau 5kg', unit: '1', prix_ht: 6.94, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'FRO14', name: 'Chèvre Tranche 60mm 1,1kG', unit: '1', prix_ht: 15.45, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'FRO15', name: 'Chèvre Tranche 78mm 0,5kg', unit: '0.5', prix_ht: 7.14, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'SNA08', name: 'Chips nature', unit: '100', prix_ht: 0.39, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'CHA20', name: 'Chorizo grande tranches', unit: '1', prix_ht: 4.95, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'CHA19', name: 'Chorizo Lanières 500g', unit: '1', prix_ht: 4.25, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'CHA33', name: 'Chute Saumon fumé Sauvage LABEYRIE 1kG', unit: '1', prix_ht: 12.50, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'LEG016', name: 'Chou rouge', unit: '1', prix_ht: 1.50, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: '', name: 'Ciboulette 1kg', unit: '1', prix_ht: 5.55, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'FRU29', name: 'Citron presse 10 litres', unit: '1', prix_ht: 2.66, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'LEG011', name: 'Citron jaune', unit: '1', prix_ht: 1.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'BOISS19', name: 'Coca Cola 1,25l', unit: '12', prix_ht: 1.58, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'LEG012', name: 'Citron vert', unit: '1', prix_ht: 2.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'LEG009', name: 'Clementine', unit: '1', prix_ht: 1.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'BOISS20', name: 'Coca Cola 0% 33cl', unit: '24', prix_ht: 0.58, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'BOISS17', name: 'Coca Cola 33cL', unit: '24', prix_ht: 0.62, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS18', name: 'Coca Cola 50cL', unit: '24', prix_ht: 0.89, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'FRU20', name: 'Cocktail 6 Fruits Rouges', unit: '1', prix_ht: 3.80, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'BOISS21', name: 'Coca Cola Cherry 33cl', unit: '24', prix_ht: 0.68, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: '', name: 'Colorant Intense Jaune', unit: '1', prix_ht: 10.23, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV097', name: 'Colorant Intense Rouge Père Noel', unit: '1', prix_ht: 8.64, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV098', name: 'Colorant Intense Rouge Royal', unit: '1', prix_ht: 15.17, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS24', name: 'Compote 33% 5/1 UNL', unit: '1', prix_ht: 7.70, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS23', name: 'Compote de pomme 26%', unit: '1', prix_ht: 6.97, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'LEG003', name: 'Concombre vendéen', unit: '1', prix_ht: 1.40, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: '', name: 'Surimi râpé', unit: '1', prix_ht: 3.10, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'SNA09', name: 'Cornflakes Country Farm', unit: '1', prix_ht: 5.50, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'SNA18', name: 'Cornichon rondelle 5/1', unit: '1', prix_ht: 6.68, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'DIV004', name: 'Coupe pate inox rigide droit', unit: '1', prix_ht: 2.72, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV003', name: 'Coupe pate inox souple rond', unit: '1', prix_ht: 2.72, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'SNA15', name: 'Courgette 4/4', unit: '1', prix_ht: 8.24, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'LEG020', name: 'Courgette', unit: '1', prix_ht: 1.80, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: '', name: 'Couronne', unit: '100', prix_ht: 4.62, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS01', name: 'Couv Blanc 33% 10kG', unit: '10', prix_ht: 16.02, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS02', name: 'Couv Lait 41% 10kG', unit: '10', prix_ht: 10.85, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'DIV086', name: 'Couv gobelet boisson chaude 18cL', unit: '50', prix_ht: 1.28, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'PATISS03', name: 'Couv noir 67% 10kG', unit: '10', prix_ht: 12.78, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS04', name: 'Couv Lait caramel 5kG', unit: '5', prix_ht: 65.30, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Couvercle gobelet 25cl 50pce', unit: '50', prix_ht: 4.10, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'CREM21', name: 'Crème fraîche Epaisse 15% 5kg', unit: '1', prix_ht: 3.02, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'DIV011', name: 'Couvercle Salade', unit: '50', prix_ht: 3.27, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'FRU27', name: 'Cranberries tendres 1kg', unit: '1', prix_ht: 7.34, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'PATISS33', name: 'Craouantine MGV 2,5kG', unit: '1', prix_ht: 7.99, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS61', name: 'Crème Arome Cacao Barry 5kG', unit: '1', prix_ht: 41.81, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'CREM20', name: 'Crème fraîche Epaisse 30% 1kG', unit: '1', prix_ht: 4.60, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CREM21', name: 'Crème fraîche Epaisse 30% 5kg', unit: '1', prix_ht: 3.75, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CREM26', name: 'Crème ganache cuisson 18% 1l', unit: '1', prix_ht: 2.75, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CREM22', name: 'Crème fraîche UHT Campina 35% 1L', unit: '1', prix_ht: 3.92, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'PATISS29', name: 'Crème pâtissière industrielle 25kG', unit: '1', prix_ht: 62.50, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'INTERNE004', name: 'Crème Patissière', unit: '1', prix_ht: 0.98, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: '', name: 'Crème pâtissière', unit: '1', prix_ht: 0.98, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: '', name: 'Crème pâtissière chocolat', unit: '1', prix_ht: 1.97, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'CREM25', name: 'Crème UHT 35% BAG IN BOX 10l', unit: '10', prix_ht: 3.69, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'CREM23', name: 'Crème UHT Culinaire 18% 1L', unit: '1', prix_ht: 2.69, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CREM24', name: 'Crème UHT Bleue 35%', unit: '', prix_ht: 3.48, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'PATISS72', name: 'Crépaillette 2,5kg', unit: '1', prix_ht: 6.67, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'AUT11', name: 'Croissant 65g', unit: '1', prix_ht: 46.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'AUT15', name: 'Croissant mini 25g', unit: '1', prix_ht: 31.93, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: '', name: 'Cube bleu frais dés 500g', unit: '0.5', prix_ht: 15.00, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Cuillère bois', unit: '100', prix_ht: 2.35, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: '', name: 'Curry poudre', unit: '1', prix_ht: 8.23, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'BOISS02', name: 'Eau cristaline 1,5l', unit: '6', prix_ht: 0.19, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'CHA04', name: 'Dés de jambon cuit 1kg', unit: '1', prix_ht: 6.32, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'PATISS18', name: 'Drops chocolat 44% 25kG', unit: '1', prix_ht: 5.95, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'EAU001', name: 'Eau', unit: '1', prix_ht: 0.00, tva: 0.055, cat: 'Boissons', four: 'Veolia' },
  { ref: 'BOISS01', name: 'Eau cristaline 50cL', unit: '24', prix_ht: 0.15, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS04', name: 'Eau cristaline Fraise 50cl', unit: '24', prix_ht: 0.66, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS03', name: 'Eau cristaline peche 50cl', unit: '24', prix_ht: 0.66, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: '', name: 'Echalotte surg 250g', unit: '0.25', prix_ht: 5.54, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS70', name: 'Eclat croustillant Lion 400g', unit: '1', prix_ht: 13.00, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'CHA17', name: 'Effiloche porc marine bbq 500g', unit: '1', prix_ht: 12.40, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'CHA07', name: 'Emincée C.Poulet TEX MEX 1kG', unit: '1', prix_ht: 8.00, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'FRO03', name: 'Emmental Dés 500gr', unit: '1', prix_ht: 4.10, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CHA05', name: 'Emincés poulet cuit Halal 2,5kg', unit: '1', prix_ht: 7.40, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'FRO01', name: 'Emmental Râpé 45% 1kG', unit: '1', prix_ht: 6.50, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'FRO02', name: 'Emmental Tranchette 40 tranches kG', unit: '1', prix_ht: 0.19, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Estragon haché 250g', unit: '0.25', prix_ht: 2.25, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'DIV038', name: 'Essuie maxi main *6', unit: '6', prix_ht: 1.65, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'BOISS12', name: 'Fanta Citron 50cL', unit: '12', prix_ht: 0.95, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS11', name: 'Fanta Orange 50cL', unit: '12', prix_ht: 0.91, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS10', name: 'Fanta Orange 33cL', unit: '24', prix_ht: 0.59, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: '', name: 'Fèves 2025', unit: '1', prix_ht: 0.66, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'GIR002', name: 'Farine Bio Bise UE', unit: '25', prix_ht: 1.09, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'GIR003', name: 'Farine Complet Arthur', unit: '25', prix_ht: 0.99, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'GIR004', name: 'Farine du Marché', unit: '25', prix_ht: 0.68, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'GIR001', name: 'Farine Emilie TF T65', unit: '25', prix_ht: 0.70, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'GIR006', name: 'Farine Spéciale Feuilletage', unit: '25', prix_ht: 0.89, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'GIR005', name: 'Farine T45', unit: '25', prix_ht: 1.05, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: '', name: 'Farine Toque Mauve', unit: '1', prix_ht: 0.90, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'AUT17', name: 'Feta mini dés 1,3kg', unit: '1', prix_ht: 18.27, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'INTERNE005', name: 'Feuilletage', unit: '1', prix_ht: 1.69, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'FRU02', name: 'Figues 10kg', unit: '1', prix_ht: 5.21, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: '', name: 'Fond plie 10cm Or/Noir', unit: '200', prix_ht: 7.60, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV078', name: 'Film Alimentaire', unit: '1', prix_ht: 6.99, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV077', name: 'Flle PEHD Transparente 60*80', unit: '1000', prix_ht: 0.02, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'SNA07', name: 'Flocon de pomme terre sac 5kg', unit: '1', prix_ht: 19.35, tva: 0.055, cat: 'Snacking', four: 'BackEurop THOMAS' },
  { ref: 'DIV014', name: 'Fond plie 13cm Or/Noir', unit: '200', prix_ht: 7.80, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'AUT08', name: 'Fondant congel fondaleb 15kg', unit: '1', prix_ht: 2.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'CREM05', name: 'Fondant Blanc 15kG', unit: '1', prix_ht: 1.83, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Fondant chocolat', unit: '1', prix_ht: 2.38, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'PATISS05', name: 'Fondette Tevenn 36% 5kg WEISS', unit: '1', prix_ht: 82.09, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS43', name: 'Fourrage Pata\'Noisette 6kg', unit: '1', prix_ht: 27.00, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Fraise Tagada 210 pce', unit: '210', prix_ht: 11.15, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'LEG027', name: 'Fraise plateau', unit: '1', prix_ht: 8.60, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'FRU09', name: 'Framboise 13kg', unit: '1', prix_ht: 5.05, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: '', name: 'Framboise pépin', unit: '1', prix_ht: 5.89, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'FRU07', name: 'Framboise 5kG', unit: '1', prix_ht: 5.51, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'FRU08', name: 'Framboise 8kG', unit: '1', prix_ht: 7.70, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'LEG008', name: 'Framboise barquette', unit: '1', prix_ht: 3.20, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'FRU06', name: 'Framboise bille 1kG', unit: '1', prix_ht: 6.38, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'FRU10', name: 'Framboise petite taille M', unit: '1', prix_ht: 20.90, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'PATISS60', name: 'Framboise pépin', unit: '6kg', prix_ht: 4.90, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'SNA04', name: 'Frites surgelées 2,5kG', unit: '1', prix_ht: 1.65, tva: 0.055, cat: 'Snacking', four: 'TeamOuest France Frais' },
  { ref: 'BOISS16', name: 'Fuze tea 40cL', unit: '12', prix_ht: 0.80, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS15', name: 'Fuze tea 33cL', unit: '24', prix_ht: 0.55, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: '', name: 'Galette de poulet pané Cornflakes', unit: '5', prix_ht: 7.55, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Galette de poulet pané', unit: '5kg', prix_ht: 7.45, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Ganache montée', unit: '1', prix_ht: 6.58, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: '', name: 'Gant M', unit: '100', prix_ht: 4.62, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS76', name: 'Gateau nougat nature 20 parts', unit: '1', prix_ht: 82.00, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS38', name: 'Gélatine Poudre Bovine 200 Briancon 1 kG', unit: '1', prix_ht: 20.56, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'FRU24', name: 'Glucose déshydraté 5kg', unit: '1', prix_ht: 3.41, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'FRU23', name: 'Glucose sirop eau 15kG', unit: '1', prix_ht: 1.46, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'DIV085', name: 'Gobelet boisson chaude 18cL', unit: '50', prix_ht: 1.20, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: '', name: 'Gobelet boisson chaude 25cL 50pce', unit: '50', prix_ht: 3.20, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV031', name: 'Grain café 1kG', unit: '1', prix_ht: 13.59, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'FAR04', name: 'Graine Pavot Bleu 5kg', unit: '1', prix_ht: 4.35, tva: 0.055, cat: 'Farines & Levains', four: 'Fuseau' },
  { ref: 'CHA24', name: 'Graine sésame Blanc 5kG', unit: '1', prix_ht: 3.64, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'PATISS19', name: 'Grains café / Choco 1kg', unit: '1', prix_ht: 11.77, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Graisse de palme 10kg', unit: '10', prix_ht: 2.95, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FRU21', name: 'Griotte Denoyotée 1kG', unit: '1', prix_ht: 4.34, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Haricot Vert Surj 2,5kg', unit: '2.5', prix_ht: 2.07, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'AUT04', name: 'Huile de Colza 5l', unit: '1', prix_ht: 1.59, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'AUT06', name: 'Huile de friture 20l', unit: '1', prix_ht: 2.00, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'SNA01', name: 'Huile de tournesol 5L', unit: '1', prix_ht: 1.80, tva: 0.055, cat: 'Snacking', four: 'TeamOuest France Frais' },
  { ref: 'AUT05', name: 'Huile d\'olive 5l', unit: '1', prix_ht: 8.10, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'BOISS13', name: 'Ice Tea Pêche 33cL', unit: '24', prix_ht: 0.62, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'BOISS14', name: 'Ice Tea Pêche 50cL', unit: '12', prix_ht: 1.03, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'CHA01', name: 'Jambon Blanc Tranche', unit: '20', prix_ht: 6.99, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'CHA03', name: 'Jambon Cru de Pays', unit: '1', prix_ht: 4.95, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'OEU03', name: 'Jaune Œuf Cocotine PEP 1kG', unit: '1', prix_ht: 5.39, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'K d\'arôme', unit: '5kg', prix_ht: 7.90, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV091', name: 'Kit couverts Bois', unit: '250', prix_ht: 0.08, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'LEG005', name: 'Kiwi', unit: '1', prix_ht: 0.39, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: '', name: 'Lait entier', unit: '1', prix_ht: 0.99, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'CREM01', name: 'Lait 1/2 Ecrémé 1L', unit: '6', prix_ht: 0.79, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: '', name: 'Lait Concentré dosette', unit: '240', prix_ht: 0.14, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'CREM02', name: 'Lait concentré Sucre Régilait 397g', unit: '1', prix_ht: 6.79, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'CHA15', name: 'Lamelle bœuf Cuite grillée 3kg', unit: '3', prix_ht: 52.76, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'CHA21', name: 'Lardon 1kG', unit: '1', prix_ht: 6.00, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'DIV036', name: 'Lavette ajourée anti bact bleue', unit: '25', prix_ht: 4.99, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'INTERNE002', name: 'Levain Dur', unit: '1', prix_ht: 0.72, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'CREM09', name: 'Levure chimique 1kG', unit: '1', prix_ht: 4.69, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'CREM10', name: 'Levure ecopack levamax 2,5kg', unit: '1', prix_ht: 1.77, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'CREM08', name: 'Levure Hirondelle 1895 Bande 2,5kG', unit: '1', prix_ht: 3.45, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CREM07', name: 'Levure Hirondelle Bleue 2,5kG', unit: '1', prix_ht: 3.05, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'CREM06', name: 'Levure Hirondelle Or 2,5kG', unit: '1', prix_ht: 3.85, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: '', name: 'Liqueur de chouan 5l', unit: '5', prix_ht: 17.39, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'FAR03', name: 'Maïs Boite 4/4 600g', unit: '1', prix_ht: 2.05, tva: 0.055, cat: 'Farines & Levains', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Margarine 10kg', unit: '10', prix_ht: 2.50, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Mascarpone 500g', unit: '0.5', prix_ht: 3.65, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'SAU02', name: 'Mayonnaise 5L', unit: '1', prix_ht: 10.80, tva: 0.055, cat: 'Sauces & Condiments', four: 'Fuseau' },
  { ref: 'FAR05', name: 'Mélange 6 Graines 25kG', unit: '1', prix_ht: 2.11, tva: 0.055, cat: 'Farines & Levains', four: 'Fuseau' },
  { ref: '', name: 'Melon', unit: '1', prix_ht: 1.55, tva: 0.055, cat: 'Divers', four: 'Terre et marée' },
  { ref: '', name: 'Merguez rondelles', unit: '1', prix_ht: 11.35, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'CREM04', name: 'Miel Seau 5kg', unit: '1', prix_ht: 3.99, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'BOISS30', name: 'Minute Maid Orange 33cL', unit: '24', prix_ht: 0.70, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'BOISS29', name: 'Minute Maid Pomme 33cL', unit: '24', prix_ht: 0.64, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'FRU26', name: 'Mirabelle France Sirop 2/1', unit: '1', prix_ht: 4.68, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'DIV084', name: 'Moule Alu To 200 Hauteur 38', unit: '1', prix_ht: 0.16, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'SAU03', name: 'Moutarde Seau 5kG', unit: '1', prix_ht: 2.18, tva: 0.055, cat: 'Sauces & Condiments', four: 'BackEurop THOMAS' },
  { ref: 'FRO10', name: 'Mozzarella bille 1300g', unit: '1', prix_ht: 12.66, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'FRO08', name: 'Mozzarella Cossette 2kG', unit: '1', prix_ht: 5.26, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'FRO09', name: 'Mozzarella Tranche 65mm 1.3kG', unit: '1', prix_ht: 12.45, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'LEG028', name: 'Myrtille barquette', unit: '1', prix_ht: 2.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'PATISS42', name: 'Nappage Blond seau 14kg', unit: '1', prix_ht: 30.66, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'PATISS41', name: 'Nappage neutre seau 7kg', unit: '1', prix_ht: 2.70, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS77', name: 'Nappage Spray Neutre BIB 13kg', unit: '1', prix_ht: 23.79, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS62', name: 'Noisette decortiquée 13/15 1kG', unit: '1', prix_ht: 8.50, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Noisette entière 1kg', unit: '1', prix_ht: 12.15, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS64', name: 'Noisette Hachée 2/4mm 1kg', unit: '1', prix_ht: 8.50, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS63', name: 'Noisette poudre grise 1kG', unit: '1', prix_ht: 10.13, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS21', name: 'Nutella pot 3kG', unit: '1', prix_ht: 8.19, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'BOISS24', name: 'Oasis Pomme Cassis Framboise 33cL', unit: '24', prix_ht: 0.58, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'BOISS25', name: 'Oasis Pomme Cassis Framboise 50cL', unit: '24', prix_ht: 0.97, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS22', name: 'Oasis Tropical 33cL', unit: '24', prix_ht: 0.51, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS23', name: 'Oasis Tropical 50cL', unit: '12', prix_ht: 0.97, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'OEU01', name: 'Œuf Entier Liquide OVIPAC 5kG', unit: '1', prix_ht: 3.60, tva: 0.055, cat: 'Pâtisserie', four: 'TeamOuest France Frais' },
  { ref: 'OEU04', name: 'Œuf Frais', unit: '360', prix_ht: 2.72, tva: 0.055, cat: 'Pâtisserie', four: 'Millepieds' },
  { ref: 'CHA29', name: 'Oignon emincés surgelé 2,5kG', unit: '1', prix_ht: 1.71, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'CHA30', name: 'Oignon frit 2,5kg', unit: '1', prix_ht: 5.42, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'LEG019', name: 'Oignon jaune', unit: '1', prix_ht: 0.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'LEG018', name: 'Oignon rouge', unit: '1', prix_ht: 1.35, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'SNA14', name: 'Olive noire denoyotée 4/4', unit: '1', prix_ht: 2.16, tva: 0.055, cat: 'Snacking', four: 'BackEurop THOMAS' },
  { ref: 'LEG013', name: 'Orange dessert', unit: '1', prix_ht: 1.80, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'LEG014', name: 'Orange Jus', unit: '1', prix_ht: 0.99, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'BOISS08', name: 'Orangina 33cL', unit: '24', prix_ht: 0.52, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'BOISS09', name: 'Orangina 50cL', unit: '12', prix_ht: 0.93, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'FRU31', name: 'Ouetsche N.Azoioue Sirop 2/1', unit: '1', prix_ht: 49.93, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'PATISS69', name: 'Paillette Feuilletine 2,5kg', unit: '1', prix_ht: 10.64, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS68', name: 'Paillette Super fin 1kg', unit: '1', prix_ht: 11.35, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Pain Burger', unit: '1', prix_ht: 0.12, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'AUT12', name: 'Pain chocolat 75g', unit: '1', prix_ht: 55.74, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'AUT14', name: 'Pain chocolat mini 28g', unit: '1', prix_ht: 30.78, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'AUT13', name: 'Pain raisin 120g', unit: '1', prix_ht: 58.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'AUT16', name: 'Pain raisin mini 35g', unit: '1', prix_ht: 30.31, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'AUT10', name: 'Pain suedois rond d16', unit: '1', prix_ht: 16.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV090', name: 'Panibois Duc Uni Carton 100', unit: '100', prix_ht: 0.30, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV040', name: 'Papier silicone blanc 60x40', unit: '500', prix_ht: 20.00, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FRO04', name: 'Parmesan petales 500g', unit: '1', prix_ht: 9.15, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: '', name: 'Pâte à choux Eclair', unit: '1', prix_ht: 0.01, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: '', name: 'Pâte à cookie', unit: '1', prix_ht: 1.91, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'PATISS26', name: 'Pâte à tartiner Speculos 3kg', unit: '1', prix_ht: 31.50, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS25', name: 'Pâte à tartiner Speculos 720g', unit: '1', prix_ht: 10.65, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS17', name: 'Pâte amandes 23% Blanche 6kg', unit: '1', prix_ht: 4.79, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'INTERNE001', name: 'Pâte Fermenté', unit: '1', prix_ht: 0.47, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'INTERNE003', name: 'Pâte Fermentée Viennoiserie', unit: '1', prix_ht: 3.01, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'INTERNE006', name: 'Pâte Tradition', unit: '1', prix_ht: 0.11, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: 'PATISS40', name: 'Pectine NH Nappage 1kG', unit: '1', prix_ht: 43.90, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'DIV006', name: 'Pellon a four alu', unit: '1', prix_ht: 117.12, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'SNA10', name: 'Pennes rigate 5kg', unit: '1', prix_ht: 1.70, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'BOISS31', name: 'Perrier 33cL', unit: '24', prix_ht: 0.57, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: '', name: 'Persil 1kg', unit: '', prix_ht: 4.95, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'SAU08', name: 'Pesto Rouge 340g', unit: '1', prix_ht: 14.95, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: 'SAU05', name: 'Pesto Vert 900g', unit: '1', prix_ht: 10.05, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: 'CHA11', name: 'Pétale de jambon cru de pays 500g', unit: '1', prix_ht: 5.99, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'DIV001', name: 'Pinceau soies naturelles 40', unit: '1', prix_ht: 5.08, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV002', name: 'Pinceau soies naturelles 50', unit: '1', prix_ht: 6.36, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV015', name: 'Pipette plastique 4mL', unit: '100', prix_ht: 6.00, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'PATISS79', name: 'Pistache Decortiquée 1kG', unit: '1', prix_ht: 28.83, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS67', name: 'Pistache Pâte 3kg', unit: '1', prix_ht: 76.50, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'DIV060', name: 'Plaque calage Tulicup PM 35mns', unit: '5', prix_ht: 4.19, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV059', name: 'Plaque Or Noir/Or 60*40', unit: '25', prix_ht: 15.85, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV050', name: 'Plaque rond Uni Or 16', unit: '100', prix_ht: 5.45, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV051', name: 'Plaque rond Uni Or 18', unit: '100', prix_ht: 6.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV048', name: 'Plaque rond Uni Or 20', unit: '100', prix_ht: 6.98, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV049', name: 'Plaque rond Uni Or 24', unit: '100', prix_ht: 10.34, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV046', name: 'Plaque rond Uni Or 26', unit: '100', prix_ht: 11.28, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV047', name: 'Plaque rond Uni Or 28', unit: '100', prix_ht: 13.74, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV052', name: 'Plaque ronds uni Noir et Or 16', unit: '100', prix_ht: 5.69, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV053', name: 'Plaque ronds uni Noir et Or 18', unit: '100', prix_ht: 6.39, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV054', name: 'Plaque ronds uni Noir et Or 20', unit: '100', prix_ht: 7.59, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV055', name: 'Plaque ronds uni Noir et Or 22', unit: '100', prix_ht: 8.85, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV056', name: 'Plaque ronds uni Noir et Or 24', unit: '100', prix_ht: 11.65, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV057', name: 'Plaque ronds uni Noir et Or 26', unit: '100', prix_ht: 13.49, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV058', name: 'Plaque ronds uni Noir et Or 28', unit: '100', prix_ht: 17.59, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV083', name: 'Plaque tritan flocon 5cms BARRY', unit: '1', prix_ht: 22.64, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV041', name: 'Plat Alu "Alupla" 138', unit: '100', prix_ht: 5.03, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV010', name: 'Plateau Mignardises 165x115', unit: '1', prix_ht: 1.82, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV019', name: 'Plateau Traiteur Argent 28*42', unit: '25', prix_ht: 8.45, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV017', name: 'Plateau Traiteur Noir 28*42', unit: '25', prix_ht: 9.25, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV016', name: 'Plateau Traiteur Or 28*42', unit: '25', prix_ht: 8.32, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV079', name: 'Poche jetable 54cm', unit: '100', prix_ht: 0.07, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'LEG010', name: 'Poire', unit: '1', prix_ht: 2.25, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: '', name: 'Poire cube 10kg', unit: '1', prix_ht: 3.20, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FRU12', name: 'Poire entière 1/2', unit: '1', prix_ht: 2.94, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'FRU11', name: 'Poire sirop 5/1', unit: '1', prix_ht: 10.26, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'SNA17', name: 'Poivron a l\'huile grillés 4/4', unit: '1', prix_ht: 8.48, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'LEG023', name: 'Poivron jaune', unit: '1', prix_ht: 2.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'SNA16', name: 'Poivron lanières tricolores 5/1', unit: '1', prix_ht: 2.30, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'LEG021', name: 'Poivron rouge', unit: '1', prix_ht: 2.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'CHA28', name: 'Poivron rouge vert lanie 2,5kG', unit: '1', prix_ht: 4.81, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'CHA27', name: 'Poivron Rouge/Vert/Jaune 2,5kG', unit: '1', prix_ht: 7.01, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'LEG022', name: 'Poivron vert', unit: '1', prix_ht: 2.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'LEG015', name: 'Pomme de terre', unit: '1', prix_ht: 0.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'SNA05', name: 'Pomme de terre lamelle 2,5kg', unit: '1', prix_ht: 4.38, tva: 0.055, cat: 'Snacking', four: 'TeamOuest France Frais' },
  { ref: 'FRU05', name: 'Pomme entière 1/2', unit: '1', prix_ht: 2.34, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'FRU04', name: 'Pomme gala 18,2kG', unit: '1', prix_ht: 1.03, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'LEG026', name: 'Pomme golden', unit: '1', prix_ht: 1.50, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'PATISS54', name: 'Pomme Pêche Blanche 1kg', unit: '1', prix_ht: 6.71, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS53', name: 'Pomme Pomme verte 1kg', unit: '1', prix_ht: 5.57, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'SNA06', name: 'Pomme ROSTI TOASTIES 2,5kg', unit: '1', prix_ht: 2.99, tva: 0.055, cat: 'Snacking', four: 'Richard Distribution' },
  { ref: 'DIV018', name: 'Pot dessert 200mL', unit: '200', prix_ht: 6.73, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV012', name: 'Pots rond Salade Kraft', unit: '50', prix_ht: 5.82, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV013', name: 'Pots ronds wrap kraft', unit: '50', prix_ht: 3.49, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'PATISS32', name: 'Poudre à lever BE 1kG', unit: '1', prix_ht: 5.60, tva: 0.055, cat: 'Pâtisserie', four: 'Richard Distribution' },
  { ref: 'AUT07', name: 'Poudre Crème chaud 25kg', unit: '1', prix_ht: 2.50, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS31', name: 'Poudre crème pâtissière 25kG', unit: '1', prix_ht: 3.09, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS30', name: 'Poudre crème pâtissière 5kG', unit: '1', prix_ht: 3.72, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'CREM03', name: 'Poudre lait Entier 26% 25kG', unit: '1', prix_ht: 5.16, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Fuseau' },
  { ref: 'CHA06', name: 'Poulet kebab 1kG', unit: '1', prix_ht: 8.00, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'PATISS39', name: 'Praligrain Marguerite 1kG', unit: '1', prix_ht: 24.43, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS35', name: 'Praline Amandes / Noisettes 5kg', unit: '1', prix_ht: 6.25, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'DIV039', name: 'Produits ménager 5L', unit: '1', prix_ht: 13.25, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FRU28', name: 'Pruneaux denoyoté 2,5kg', unit: '1', prix_ht: 6.02, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Pulco 33cL', unit: '24', prix_ht: 0.67, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'BOISS34', name: 'Pulco 50cL', unit: '12', prix_ht: 0.89, tva: 0.055, cat: 'Boissons', four: 'Supergroup' },
  { ref: 'PATISS46', name: 'Pure Fruit Passion 1kg', unit: '1', prix_ht: 6.56, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS55', name: 'Purée Abricot 1kg', unit: '1', prix_ht: 5.11, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS47', name: 'Purée Ananas 1kg', unit: '1', prix_ht: 7.61, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'PATISS45', name: 'Purée banane 1kg', unit: '1', prix_ht: 5.52, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS49', name: 'Purée Cassis 1kg', unit: '1', prix_ht: 6.69, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS50', name: 'Purée fraise 1kg', unit: '1', prix_ht: 5.22, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS56', name: 'Purée Framboise 1kG', unit: '1', prix_ht: 7.14, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS48', name: 'Purée Fruit exotique 1kg', unit: '1', prix_ht: 7.90, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Purée fruits rouges', unit: '1', prix_ht: 8.71, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS78', name: 'Purée Mangue 1kg', unit: '1', prix_ht: 6.91, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS51', name: 'Purée Orange 1kg', unit: '1', prix_ht: 7.19, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Purée Passion 10kg', unit: '10', prix_ht: 9.17, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'PATISS44', name: 'Purée Poire 1kg', unit: '1', prix_ht: 4.71, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS52', name: 'Purée Pomme verte 1kg', unit: '1', prix_ht: 5.57, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'FRU30', name: 'Quetsches Sirop 21', unit: '1', prix_ht: 4.85, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Raclette Tranche', unit: '1', prix_ht: 3.78, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'LEG007', name: 'Raisin noir', unit: '1', prix_ht: 4.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'FRU01', name: 'Raisin sec 15kG', unit: '1', prix_ht: 3.25, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Fuseau' },
  { ref: 'DIV080', name: 'Rame papier cuisson 40g', unit: '500', prix_ht: 17.75, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'BOISS07', name: 'RedBull 25cL', unit: '24', prix_ht: 1.18, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'DIV071', name: 'Reglette transparente 16x3,5x3,5', unit: '1', prix_ht: 0.81, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'FAR01', name: 'Rex Borodino\'Mais 100% 15kg', unit: '1', prix_ht: 3.62, tva: 0.055, cat: 'Farines & Levains', four: 'BackEurop THOMAS' },
  { ref: 'FRU18', name: 'Rhubarbe Morceaux 1kG', unit: '1', prix_ht: 3.43, tva: 0.055, cat: 'Fruits & Garnitures', four: 'BackEurop THOMAS' },
  { ref: 'PATISS20', name: 'Rhum 40° 20L + taxe', unit: '1', prix_ht: 2.42, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Rhum 54° 20L + taxe', unit: '1', prix_ht: 3.10, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'CHA12', name: 'Rillaud mini 500g', unit: '1', prix_ht: 7.75, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'SNA20', name: 'Riz long 5kG', unit: '1', prix_ht: 1.46, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'FRO12', name: 'Roblochon D,80mm 650g centurion', unit: '1', prix_ht: 4.50, tva: 0.055, cat: 'Fromages & Crèmes', four: 'TeamOuest France Frais' },
  { ref: 'FRO11', name: 'Roblochon tranche 500g', unit: '1', prix_ht: 9.00, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'DIV072', name: 'Rond languette 8cm anis/fushia', unit: '200', prix_ht: 0.05, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV076', name: 'Rond Or 9cm', unit: '200', prix_ht: 0.06, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV073', name: 'Rond Or/Blanc 8cm', unit: '200', prix_ht: 0.05, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV074', name: 'Rond Or/Noir 8cm', unit: '200', prix_ht: 0.04, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV075', name: 'Rond Or/Noir 9cm', unit: '200', prix_ht: 0.05, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'CHA13', name: 'Rosette tranche 1kG', unit: '1', prix_ht: 11.96, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'CHA16', name: 'Roti de porc cuit 14 tranches 500g', unit: '1', prix_ht: 6.24, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'DIV009', name: 'Rouleau PVC Incolore 45mm 100 microns', unit: '1', prix_ht: 7.55, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV008', name: 'Rouleau scelleuse rouge', unit: '1', prix_ht: 1.29, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Sablée Breton', unit: '1', prix_ht: 2.43, tva: 0.055, cat: 'Divers', four: 'PAP' },
  { ref: '', name: 'Sac à galette', unit: '100', prix_ht: 11.05, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'EMB01', name: 'Sachet Brioche', unit: '1', prix_ht: 0.14, tva: 0.055, cat: 'Emballages', four: 'Minoterie Girardeau' },
  { ref: '', name: 'Sachet Neutre 14*25', unit: '100', prix_ht: 0.05, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV068', name: 'Sacs AF neutre 10*22', unit: '100', prix_ht: 0.09, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV067', name: 'Sacs AF neutre 14*30', unit: '100', prix_ht: 0.11, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV065', name: 'Sacs Bio Pain Beige', unit: '200', prix_ht: 6.40, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV062', name: 'Sacs Bio Pain Bleu', unit: '200', prix_ht: 5.80, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV064', name: 'Sacs Bio Pain Jaune', unit: '200', prix_ht: 4.54, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV063', name: 'Sacs Bio Pain Vert', unit: '200', prix_ht: 4.52, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'DIV096', name: 'Sacs brioche Kraft', unit: '1000', prix_ht: 0.03, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV070', name: 'Sacs cabas kraft anse', unit: '250', prix_ht: 0.10, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV089', name: 'Sacs CELLO Plat', unit: '100', prix_ht: 0.11, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV093', name: 'Sacs croissant Kraft taille2', unit: '1000', prix_ht: 0.01, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV094', name: 'Sacs croissant Kraft taille3', unit: '1000', prix_ht: 0.01, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV095', name: 'Sacs croissant Kraft taille4', unit: '1000', prix_ht: 0.01, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'DIV069', name: 'Sacs Polypro 24*53', unit: '2000', prix_ht: 0.05, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'DIV037', name: 'Sacs poubelles 130L', unit: '20', prix_ht: 5.00, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'DIV066', name: 'Sacs Sandwich taupe', unit: '1000', prix_ht: 15.39, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'LEG001', name: 'Salade batavia sachet', unit: '1', prix_ht: 4.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'CHA23', name: 'Salade composée 500g', unit: '1', prix_ht: 1.88, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Fuseau' },
  { ref: 'LEG024', name: 'Salade Mache', unit: '0.25', prix_ht: 1.95, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'LEG025', name: 'Salade Roquette', unit: '0.25', prix_ht: 2.20, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'BOISS06', name: 'San Pellegrino 50cL', unit: '24', prix_ht: 0.44, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: '', name: 'Sauce Algérienne', unit: '1', prix_ht: 4.10, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'SAU11', name: 'Sauce Barbecue Lesieur 970mL', unit: '1', prix_ht: 2.69, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: 'SAU06', name: 'Sauce blanche 860g', unit: '1', prix_ht: 3.10, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Sauce Cesar', unit: '1', prix_ht: 3.69, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'SAU07', name: 'Sauce Curry 950g', unit: '1', prix_ht: 3.03, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Sauce Hannibal Samouraï', unit: '1', prix_ht: 3.99, tva: 0.055, cat: 'Divers', four: 'Richard Distribution' },
  { ref: 'SAU01', name: 'Sauce Ketchup 950g', unit: '1', prix_ht: 2.75, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Sauce Moutarde seau', unit: '5', prix_ht: 2.80, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'SAU04', name: 'Sauce Risso Andalouse 1L', unit: '1', prix_ht: 3.94, tva: 0.055, cat: 'Sauces & Condiments', four: 'TeamOuest France Frais' },
  { ref: 'SAU08', name: 'Sauce salade 100 dosettes', unit: '100', prix_ht: 3.26, tva: 0.055, cat: 'Sauces & Condiments', four: 'BackEurop THOMAS' },
  { ref: 'CHA34', name: 'Saumon petite tranche fumé 300g', unit: '1', prix_ht: 12.50, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'DIV035', name: 'Savarin Carré', unit: '112', prix_ht: 38.32, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: '', name: 'Schweppes Agrum 33cL', unit: '24', prix_ht: 0.61, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'BOISS28', name: 'Schweppes Agrum 50cL', unit: '12', prix_ht: 0.99, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'DIV007', name: 'Scotch 66m', unit: '1', prix_ht: 1.23, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'CREM28', name: 'Sel fin 25kG', unit: '1', prix_ht: 0.27, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'CREM27', name: 'Sel Gros gris guerande 25kg', unit: '1', prix_ht: 0.79, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'DIV088', name: 'Serviettes blanches', unit: '500', prix_ht: 3.46, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'PATISS27', name: 'Speculos concassé 900g', unit: '1', prix_ht: 5.31, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'BOISS26', name: 'Sprite 33cL', unit: '24', prix_ht: 0.49, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'BOISS27', name: 'Sprite 50cL', unit: '12', prix_ht: 0.85, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: 'CHA14', name: 'Steak Haché Charal', unit: '50', prix_ht: 12.80, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: '', name: 'Steak Haché frais', unit: '1', prix_ht: 10.58, tva: 0.055, cat: 'Divers', four: 'SCV' },
  { ref: '', name: 'Steak Végé 110g', unit: '2,2kg', prix_ht: 15.15, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'SAU09', name: 'Stick Ketchup', unit: '500', prix_ht: 17.00, tva: 0.055, cat: 'Sauces & Condiments', four: 'BackEurop THOMAS' },
  { ref: 'SAU10', name: 'Stick Mayonnaise', unit: '500', prix_ht: 18.12, tva: 0.055, cat: 'Sauces & Condiments', four: 'BackEurop THOMAS' },
  { ref: 'PATISS09', name: 'Sucre cassonade 25kG (Pure Canne)', unit: '1', prix_ht: 1.47, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS06', name: 'Sucre Crist Semoule 25kG', unit: '1', prix_ht: 0.86, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Sucre décor', unit: '5', prix_ht: 3.00, tva: 0.055, cat: 'Divers', four: 'BackEurop THOMAS' },
  { ref: 'PATISS07', name: 'Sucre glace sac papier 10kG', unit: '1', prix_ht: 1.11, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'PATISS08', name: 'Sucre Grain n°6 10kG', unit: '1', prix_ht: 1.78, tva: 0.055, cat: 'Pâtisserie', four: 'BackEurop THOMAS' },
  { ref: 'CHA32', name: 'Surimi Rapé 500gr', unit: '1', prix_ht: 3.04, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'BackEurop THOMAS' },
  { ref: 'CREM11', name: 'Beurre tartinable 1kg', unit: '1', prix_ht: 6.79, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'CREM12', name: 'Tartimalin Fromage à la crème 1L', unit: '1', prix_ht: 7.35, tva: 0.055, cat: 'Fromages & Crèmes', four: 'Richard Distribution' },
  { ref: 'CHA31', name: 'Thon morceaux 650gr', unit: '1', prix_ht: 3.88, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'LEG004', name: 'Tomate cerise barquette', unit: '1', prix_ht: 2.25, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'SNA12', name: 'Tomate confite 4/4', unit: '1', prix_ht: 6.99, tva: 0.055, cat: 'Snacking', four: 'Richard Distribution' },
  { ref: 'SNA13', name: 'Tomate fraîches 57/67', unit: '1', prix_ht: 2.15, tva: 0.055, cat: 'Snacking', four: 'Fuseau' },
  { ref: 'CHA26', name: 'Tomate pizzata 4/4', unit: '1', prix_ht: 2.65, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'Richard Distribution' },
  { ref: 'SNA11', name: 'Tomate pizzata 4/4 Brousse', unit: '1', prix_ht: 2.65, tva: 0.055, cat: 'Snacking', four: 'Richard Distribution' },
  { ref: 'LEG002', name: 'Tomates rondes', unit: '1', prix_ht: 2.25, tva: 0.055, cat: 'Légumes', four: 'Terre et marée' },
  { ref: 'FRO16', name: 'Tomme de brebis Tranche 400g', unit: '1', prix_ht: 7.57, tva: 0.055, cat: 'Fromages & Crèmes', four: 'BackEurop THOMAS' },
  { ref: 'GIR005', name: 'Top Fournil', unit: '10', prix_ht: 4.49, tva: 0.055, cat: 'Divers', four: 'Minoterie Girardeau' },
  { ref: 'SNA02', name: 'Tortillas Wraps 30cm', unit: '15', prix_ht: 3.83, tva: 0.055, cat: 'Snacking', four: 'Richard Distribution' },
  { ref: 'CHA35', name: 'Tost\'o Chèvre 40% Soignon 750gr', unit: '1', prix_ht: 10.79, tva: 0.055, cat: 'Charcuterie & Traiteur', four: 'TeamOuest France Frais' },
  { ref: 'PATISS10', name: 'Trimoline seau 15kg', unit: '1', prix_ht: 1.74, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: 'BOISS35', name: 'Tropico Original 33cl', unit: '24', prix_ht: 0.58, tva: 0.055, cat: 'Boissons', four: 'Richard Distribution' },
  { ref: 'PATISS75', name: 'Vanille broyée epuisée 150g', unit: '1', prix_ht: 164.17, tva: 0.055, cat: 'Pâtisserie', four: 'Fuseau' },
  { ref: '', name: 'Végétaline', unit: '1', prix_ht: 8.60, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'AUT02', name: 'Vinaigre d\'alcool blanc 1,5l', unit: '1', prix_ht: 0.69, tva: 0.055, cat: 'Divers', four: 'Fuseau' },
  { ref: 'AUT01', name: 'Vinaigre de cidre 1l', unit: '1', prix_ht: 2.19, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'AUT03', name: 'Vinaigrette balsamique', unit: '1', prix_ht: 4.40, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'BOISS05', name: 'Volvic citron 50cl', unit: '24', prix_ht: 0.70, tva: 0.055, cat: 'Boissons', four: 'Fuseau' },
  { ref: '', name: 'Coco Rapé', unit: '1', prix_ht: 6.45, tva: 0.055, cat: 'Divers', four: 'TeamOuest France Frais' },
  { ref: 'FRU22', name: 'Zeste Semoule Orange 500gr', unit: '1', prix_ht: 9.09, tva: 0.055, cat: 'Fruits & Garnitures', four: 'Richard Distribution' },
];

const CATEGORIES = ["Tous", "Farines & Levains", "Pâtisserie", "Fruits & Garnitures",
  "Fromages & Crèmes", "Charcuterie & Traiteur", "Snacking", "Légumes",
  "Sauces & Condiments", "Boissons", "Divers", "Hors mercuriale"];

const CAT_ICONS = {
  "Farines & Levains": "🌾",
  "Pâtisserie": "🥐",
  "Fruits & Garnitures": "🍓",
  "Fromages & Crèmes": "🧀",
  "Charcuterie & Traiteur": "🥩",
  "Snacking": "🥪",
  "Légumes": "🥦",
  "Sauces & Condiments": "🫙",
  "Boissons": "🥤",
  "Divers": "📦",
  "Emballages": "🛍",
  "Hors mercuriale": "✏️",
};

const MERCURIALE_URL = "Mercuriale_PAP_Septembre.xlsx";

const initialHistory = [
  { id: "CMD-2025-001", date: "2025-01-08", boulangerie: "Pense Au Pain Cholet Boulange", type: "Matières premières", total: 342.50, status: "Livré", items: 7 },
  { id: "CMD-2025-002", date: "2025-01-10", boulangerie: "La Pause Cholet", type: "Matières premières", total: 512.80, status: "En cours", items: 9 },
  { id: "CMD-2025-003", date: "2025-01-10", boulangerie: "Pense Au Pain Jard", type: "Matières premières", total: 98.40, status: "Livré", items: 3 },
  { id: "CMD-2025-004", date: "2025-01-11", boulangerie: "Pense Au Pain Cholet Sacré Coeur", type: "Matières premières", total: 724.60, status: "Livré", items: 12 },
  { id: "CMD-2025-005", date: "2025-01-13", boulangerie: "Pense Au Pain La Ferrière", type: "Matières premières", total: 210.00, status: "En cours", items: 5 },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const fmtDate = (d) => new Date(d).toLocaleDateString("fr-FR");
const today = () => new Date().toISOString().slice(0, 10);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MercurialeLink() {
  return (
    <a href={MERCURIALE_URL} download
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "linear-gradient(135deg, #217346, #1e6b3e)",
        color: "#fff", padding: "7px 14px", borderRadius: 8,
        textDecoration: "none", fontSize: 11, fontWeight: 600,
        boxShadow: "0 2px 8px rgba(33,115,70,0.3)", whiteSpace: "nowrap",
        fontFamily: "Georgia, serif"
      }}>
      📊 Mercuriale Excel
    </a>
  );
}

function PriceTag({ prix_ht, tva }) {
  const ttc = prix_ht * (1 + tva);
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
      <span style={{ fontWeight: 700, color: "#2C1810", fontSize: 13 }}>{fmt(ttc)} TTC</span>
      <span style={{ fontSize: 10, color: "#9B7B5A" }}>{fmt(prix_ht)} HT</span>
    </span>
  );
}

function CartPanel({ cart, setCart, boulangerieId, addToHistory }) {
  const total_ht = cart.reduce((s, i) => s + i.prix_ht * i.qty, 0);
  const total_ttc = cart.reduce((s, i) => s + i.prix_ht * (1 + i.tva) * i.qty, 0);
  const boulangerieNom = BOULANGERIES.find(b => b.id === boulangerieId)?.name || "";

  const handleValidate = () => {
    if (!boulangerieId || cart.length === 0) return;
    const cmd = {
      id: `CMD-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
      date: today(), boulangerie: boulangerieNom,
      type: "Matières premières", total: total_ttc,
      status: "En cours", items: cart.length,
      detail: cart.map(i => ({ ...i })),
    };
    addToHistory(cmd);
    setCart([]);
    alert(`✅ Commande ${cmd.id} passée pour ${boulangerieNom}\n${fmt(total_ttc)} TTC — ${cart.length} article(s)`);
  };

  return (
    <div style={{
      background: "#fffaf5", border: "2px solid #D4A96A", borderRadius: 14,
      padding: 18, minWidth: 270, maxWidth: 300, position: "sticky", top: 20,
      boxShadow: "0 4px 20px rgba(139,69,19,.10)", flexShrink: 0
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#2C1810", fontFamily:"Georgia" }}>
          🧺 Panier ({cart.reduce((s,i)=>s+i.qty,0)})
        </span>
        {cart.length > 0 && (
          <button onClick={() => setCart([])} style={{ background:"none", border:"none", cursor:"pointer", color:"#c0392b", fontSize:11, fontWeight:600 }}>
            Vider
          </button>
        )}
      </div>
      {cart.length === 0 ? (
        <p style={{ color: "#b89878", fontSize: 12, textAlign:"center", padding: "20px 0", margin:0 }}>Aucun article</p>
      ) : (
        <div style={{ maxHeight: 320, overflowY: "auto", display:"flex", flexDirection:"column", gap:6 }}>
          {cart.map(item => (
            <div key={item.ref || item.name} style={{ padding:"7px 9px", background:"#fff", borderRadius:8, border:"1px solid #EDD5B3" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:4 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"#2C1810", lineHeight:1.3 }}>{item.name}</div>
                  <div style={{ fontSize:10, color:"#9B7B5A" }}>{fmt(item.prix_ht)} HT × {item.qty} = {fmt(item.prix_ht * item.qty)}</div>
                </div>
                <button onClick={()=>setCart(c=>c.filter(x=>(x.ref||x.name)!==(item.ref||item.name)))}
                  style={{ border:"none", background:"#fde8e8", color:"#c0392b", borderRadius:4, width:18, height:18, cursor:"pointer", fontSize:10, flexShrink:0 }}>✕</button>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:5 }}>
                <button onClick={()=>setCart(c=>c.map(x=>(x.ref||x.name)===(item.ref||item.name)?{...x,qty:Math.max(1,x.qty-1)}:x))}
                  style={{ width:22,height:22, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:13, lineHeight:1 }}>−</button>
                <span style={{ width:24, textAlign:"center", fontSize:12, fontWeight:700 }}>{item.qty}</span>
                <button onClick={()=>setCart(c=>c.map(x=>(x.ref||x.name)===(item.ref||item.name)?{...x,qty:x.qty+1}:x))}
                  style={{ width:22,height:22, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:13, lineHeight:1 }}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {cart.length > 0 && (
        <>
          <div style={{ borderTop:"1px dashed #D4A96A", marginTop:10, paddingTop:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7A5C3A", marginBottom:3 }}>
              <span>Total HT</span><span>{fmt(total_ht)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:700, color:"#2C1810" }}>
              <span>Total TTC</span><span>{fmt(total_ttc)}</span>
            </div>
          </div>
          <button onClick={handleValidate} disabled={!boulangerieId}
            style={{
              width:"100%", marginTop:10, padding:"10px 0",
              background: boulangerieId ? "linear-gradient(135deg, #8B4513, #6B3210)" : "#ccc",
              color:"#fff", border:"none", borderRadius:9,
              cursor: boulangerieId ? "pointer" : "not-allowed",
              fontWeight:700, fontSize:12, fontFamily:"Georgia, serif",
              boxShadow: boulangerieId ? "0 3px 12px rgba(139,69,19,.35)" : "none"
            }}>
            {boulangerieId ? "✓ Valider la commande" : "Choisir une boulangerie"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── MODAL PRODUIT LIBRE ──────────────────────────────────────────────────────
function ModalProduitLibre({ onClose, onAdd }) {
  const [nom, setNom] = useState("");
  const [prix, setPrix] = useState("");
  const [qty, setQty] = useState(1);
  const [unite, setUnite] = useState("");
  const [erreur, setErreur] = useState("");

  const handleAdd = () => {
    if (!nom.trim()) { setErreur("Le nom est obligatoire."); return; }
    const p = parseFloat(prix.replace(",", "."));
    if (isNaN(p) || p <= 0) { setErreur("Indiquez un prix valide (ex: 12.50)."); return; }
    onAdd({ ref: "", name: nom.trim(), unit: unite.trim() || "—", prix_ht: p, tva: 0.055, cat: "Hors mercuriale", qty });
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", border: "2px solid #D4A96A",
    borderRadius: 8, background: "#fffaf5", fontSize: 13, color: "#2C1810",
    outline: "none", boxSizing: "border-box", fontFamily: "Calibri, sans-serif"
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: "#7A5C3A", marginBottom: 4, display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 28, width: 420, maxWidth: "90vw",
        boxShadow: "0 8px 40px rgba(0,0,0,.25)", border: "2px solid #D4A96A"
      }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div>
            <h3 style={{ margin:0, fontFamily:"Georgia", color:"#2C1810", fontSize:16 }}>✏️ Produit hors mercuriale</h3>
            <p style={{ margin:"4px 0 0", fontSize:11, color:"#9B7B5A" }}>Saisie libre — ne figure pas dans la mercuriale</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9B7B5A", lineHeight:1 }}>✕</button>
        </div>

        {/* Champs */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={labelStyle}>Désignation du produit *</label>
            <input value={nom} onChange={e => { setNom(e.target.value); setErreur(""); }}
              placeholder="Ex: Beurre extra-fin 500g"
              style={inputStyle} autoFocus />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={labelStyle}>Prix HT (€) *</label>
              <input value={prix} onChange={e => { setPrix(e.target.value); setErreur(""); }}
                placeholder="Ex: 12.50"
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Conditionnement</label>
              <input value={unite} onChange={e => setUnite(e.target.value)}
                placeholder="Ex: Sac 5kg"
                style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Quantité</label>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={() => setQty(q => Math.max(1, q-1))}
                style={{ width:34, height:34, borderRadius:8, border:"2px solid #D4A96A", background:"#fffaf5", cursor:"pointer", fontSize:16, fontWeight:700, color:"#8B4513" }}>−</button>
              <span style={{ width:40, textAlign:"center", fontSize:16, fontWeight:700, color:"#2C1810" }}>{qty}</span>
              <button onClick={() => setQty(q => q+1)}
                style={{ width:34, height:34, borderRadius:8, border:"2px solid #D4A96A", background:"#fffaf5", cursor:"pointer", fontSize:16, fontWeight:700, color:"#8B4513" }}>+</button>
              <span style={{ fontSize:11, color:"#9B7B5A", marginLeft:4 }}>unité(s)</span>
            </div>
          </div>

          {/* Aperçu prix */}
          {prix && !isNaN(parseFloat(prix.replace(",","."))) && parseFloat(prix.replace(",",".")) > 0 && (
            <div style={{ background:"#fffaf5", border:"1px solid #EDD5B3", borderRadius:8, padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:"#7A5C3A" }}>Total TTC estimé ×{qty}</span>
              <span style={{ fontWeight:700, color:"#2C1810", fontSize:13 }}>
                {fmt(parseFloat(prix.replace(",",".")) * 1.055 * qty)}
              </span>
            </div>
          )}

          {erreur && <p style={{ margin:0, color:"#c0392b", fontSize:12, fontWeight:600 }}>⚠ {erreur}</p>}
        </div>

        {/* Boutons */}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={onClose}
            style={{ flex:1, padding:"10px 0", border:"2px solid #D4A96A", borderRadius:9, background:"#fff", color:"#8B4513", cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"Georgia" }}>
            Annuler
          </button>
          <button onClick={handleAdd}
            style={{ flex:2, padding:"10px 0", border:"none", borderRadius:9, background:"linear-gradient(135deg,#8B4513,#6B3210)", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"Georgia", boxShadow:"0 3px 10px rgba(139,69,19,.35)" }}>
            + Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB COMMANDE ─────────────────────────────────────────────────────────────
function MobileCartBar({ cart, boulangerieId, setCart, addToHistory }) {
  const [open, setOpen] = useState(false);
  const total_ttc = cart.reduce((s, i) => s + i.prix_ht * (1 + i.tva) * i.qty, 0);
  const nbArticles = cart.reduce((s, i) => s + i.qty, 0);
  const boulangerieNom = BOULANGERIES.find(b => b.id === boulangerieId)?.name || "";

  const handleValidate = () => {
    if (!boulangerieId || cart.length === 0) return;
    const cmd = {
      id: `CMD-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
      date: today(), boulangerie: boulangerieNom,
      type: "Matières premières", total: total_ttc,
      status: "En cours", items: cart.length,
      detail: cart.map(i => ({ ...i })),
    };
    addToHistory(cmd);
    setCart([]);
    setOpen(false);
    alert(`✅ Commande ${cmd.id} passée pour ${boulangerieNom}\n${fmt(total_ttc)} TTC — ${cart.length} article(s)`);
  };

  return (
    <>
      {/* Mini panier déroulant au-dessus */}
      {open && (
        <div style={{
          position:"fixed", bottom:64, left:0, right:0, zIndex:199,
          background:"#fff", borderTop:"2px solid #D4A96A",
          boxShadow:"0 -4px 20px rgba(0,0,0,.2)", padding:"14px 16px",
          maxHeight:"55vh", overflowY:"auto"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontWeight:700, fontSize:14, color:"#2C1810", fontFamily:"Georgia" }}>🧺 Panier ({nbArticles})</span>
            <button onClick={() => setCart([])} style={{ background:"none", border:"none", color:"#c0392b", fontSize:11, fontWeight:600, cursor:"pointer" }}>Vider</button>
          </div>
          {cart.map(item => (
            <div key={item.ref || item.name} style={{ padding:"8px 10px", background:"#fffaf5", borderRadius:8, border:"1px solid #EDD5B3", marginBottom:6, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"#2C1810" }}>{item.name}</div>
                <div style={{ fontSize:10, color:"#9B7B5A" }}>{fmt(item.prix_ht)} HT × {item.qty} = {fmt(item.prix_ht * item.qty)}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <button onClick={() => setCart(c => c.map(x => (x.ref||x.name)===(item.ref||item.name) ? {...x, qty:Math.max(1,x.qty-1)} : x))}
                  style={{ width:24, height:24, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:14 }}>−</button>
                <span style={{ width:24, textAlign:"center", fontSize:12, fontWeight:700 }}>{item.qty}</span>
                <button onClick={() => setCart(c => c.map(x => (x.ref||x.name)===(item.ref||item.name) ? {...x, qty:x.qty+1} : x))}
                  style={{ width:24, height:24, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:14 }}>+</button>
                <button onClick={() => setCart(c => c.filter(x => (x.ref||x.name)!==(item.ref||item.name)))}
                  style={{ width:24, height:24, borderRadius:5, border:"none", background:"#fde8e8", color:"#c0392b", cursor:"pointer", fontSize:12, fontWeight:700, marginLeft:2 }}>✕</button>
              </div>
            </div>
          ))}
          <button onClick={handleValidate} disabled={!boulangerieId || cart.length === 0}
            style={{
              width:"100%", padding:"12px", marginTop:8, borderRadius:9, border:"none",
              background: boulangerieId && cart.length > 0 ? "linear-gradient(135deg,#8B4513,#6B3210)" : "#ccc",
              color:"#fff", fontWeight:700, fontSize:14, fontFamily:"Georgia", cursor: boulangerieId && cart.length > 0 ? "pointer" : "default"
            }}>
            {boulangerieId ? `✅ Valider — ${fmt(total_ttc)}` : "Choisir une boulangerie"}
          </button>
        </div>
      )}

      {/* Barre fixe en bas */}
      <div className="commande-cart-mobile-bar" onClick={() => cart.length > 0 && setOpen(o => !o)}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>🧺</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>{nbArticles > 0 ? `${nbArticles} article(s)` : "Panier vide"}</div>
            {nbArticles > 0 && <div style={{ fontSize:11, color:"#D4A96A" }}>{fmt(total_ttc)} TTC</div>}
          </div>
        </div>
        {nbArticles > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"#D4A96A" }}>{open ? "▼ Fermer" : "▲ Voir"}</span>
            <span style={{ background:"#D4A96A", color:"#2C1810", borderRadius:12, fontSize:12, fontWeight:800, padding:"2px 10px" }}>{nbArticles}</span>
          </div>
        )}
      </div>
    </>
  );
}

function TabCommande({ cart, setCart, boulangerieId, addToHistory, produits, setProduits, favoris, toggleFavori, history }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const [qtys, setQtys] = useState({});
  const [showPrixFour, setShowPrixFour] = useState(null);

  // Moyenne des quantités commandées sur les 4 dernières semaines
  const moyennes = useMemo(() => {
    if (!history || !history.length) return {};
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 28); // 4 semaines
    const map = {};
    const weeks = {};
    history.filter(cmd => {
      try { return new Date(cmd.date.split("/").reverse().join("-")) >= cutoff; } catch(e) { return false; }
    }).forEach(cmd => {
      const items = Array.isArray(cmd.detail) ? cmd.detail : [];
      items.forEach(item => {
        const key = (item.ref && item.name) ? `${item.ref}__${item.name}` : (item.ref || item.name);
        if (!key) return;
        if (!map[key]) { map[key] = 0; weeks[key] = new Set(); }
        map[key] += item.qty || 0;
        // Identifier la semaine de la commande
        try {
          const d = new Date(cmd.date.split("/").reverse().join("-"));
          const wk = `${d.getFullYear()}-W${Math.ceil((d - new Date(d.getFullYear(),0,1))/604800000)}`;
          weeks[key].add(wk);
        } catch(e) {}
      });
    });
    // Diviser par le nombre de semaines où le produit a été commandé (max 4)
    const result = {};
    Object.keys(map).forEach(key => {
      const nbSemaines = Math.min(weeks[key].size, 4);
      if (nbSemaines > 0) result[key] = Math.round((map[key] / nbSemaines) * 10) / 10;
    });
    return result;
  }, [history]);
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return produits.filter(p => {
      const mSearch = !q || p.name.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q);
      const pKey = (p.ref && p.name) ? `${p.ref}__${p.name}` : (p.ref || p.name);
      const mCat = filterCat === "Tous" ? true
                 : filterCat === "⭐ Favoris" ? favoris.includes(pKey)
                 : p.cat === filterCat;
      return mSearch && mCat;
    });
  }, [search, filterCat, produits, favoris]);

  const handleImportMercuriale = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportMsg({ type: "loading", text: "⏳ Lecture du fichier…" });
    try {
      const XLSX = await import("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/xlsx.mjs");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames.find(n => n.includes("TARIFS")) || wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

      // Lire les headers pour identifier les fournisseurs colonnes D-H
      const headerRow = rows[0] || [];
      const fourHeaders = [
        headerRow[3] ? String(headerRow[3]).trim() : "Fuseau",
        headerRow[4] ? String(headerRow[4]).trim() : "BackEurop",
        headerRow[5] ? String(headerRow[5]).trim() : "Team Ouest",
        headerRow[6] ? String(headerRow[6]).trim() : "Autres",
        headerRow[7] ? String(headerRow[7]).trim() : "Richard Distribution",
      ];

      const nouveaux = [];
      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        const ref  = row[0] ? String(row[0]).trim() : "";
        const name = row[1] ? String(row[1]).trim() : "";
        const unit = row[2] != null ? String(row[2]) : "1";
        const four = row[8] ? String(row[8]).trim() : "";
        const prix = parseFloat(row[9]);
        if (!name || isNaN(prix) || prix <= 0) continue;
        const ancien = ALL_PRODUCTS.find(p => p.ref === ref || p.name === name);
        const cat = ancien?.cat || "Divers";
        // Prix par fournisseur colonnes D(3) à H(7)
        const prix_fournisseurs = {};
        [3,4,5,6,7].forEach((col, idx) => {
          const p = parseFloat(row[col]);
          if (!isNaN(p) && p > 0) prix_fournisseurs[fourHeaders[idx]] = p;
        });
        nouveaux.push({ ref, name, unit, prix_ht: prix, tva: 0.055, cat, four, prix_fournisseurs });
      }
      if (nouveaux.length === 0) {
        setImportMsg({ type: "error", text: "❌ Aucun produit trouvé dans le fichier." });
        return;
      }

      // Sauvegarde dans Google Sheets par lots de 50
      setImportMsg({ type: "loading", text: "⏳ Sauvegarde dans Google Sheets…" });
      const BATCH = 50;
      await postToSheets(SHEETS_URL, { action: "saveMercuriale", produits: nouveaux });

      setProduits(nouveaux);
      setImportMsg({ type: "success", text: `✅ ${nouveaux.length} produits importés et sauvegardés depuis "${sheetName}"` });
      setTimeout(() => setImportMsg(null), 6000);
    } catch(err) {
      console.error(err);
      setImportMsg({ type: "error", text: "❌ Erreur lors de la lecture du fichier." });
    }
    e.target.value = "";
  };

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const key = (product.ref && product.name) ? `${product.ref}__${product.name}` : (product.ref || product.name);
      const ex = prev.find(x => ((x.ref && x.name) ? `${x.ref}__${x.name}` : (x.ref || x.name)) === key);
      if (ex) return prev.map(x => ((x.ref && x.name) ? `${x.ref}__${x.name}` : (x.ref || x.name)) === key ? { ...x, qty: x.qty + qty } : x);
      return [...prev, { ...product, qty }];
    });
  };

  const addCustomToCart = (product) => {
    setCart(prev => [...prev, { ...product }]);
  };

  return (
    <>
    {showModal && <ModalProduitLibre onClose={() => setShowModal(false)} onAdd={addCustomToCart} />}
    <div className="commande-layout">
      <div className="commande-products">
        {/* Search + boutons */}
        <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ flex:1, minWidth:200, position:"relative" }}>
            <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:15, pointerEvents:"none" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un produit ou une référence…"
              style={{
                width:"100%", padding:"9px 12px 9px 34px", border:"2px solid #D4A96A",
                borderRadius:9, background:"#fffaf5", fontSize:12, color:"#2C1810",
                outline:"none", boxSizing:"border-box"
              }} />
          </div>
          <button onClick={() => setShowModal(true)}
            style={{
              display:"inline-flex", alignItems:"center", gap:6,
              padding:"9px 16px", borderRadius:9, border:"2px dashed #C4874A",
              background:"#fff8f0", color:"#8B4513", cursor:"pointer",
              fontSize:12, fontWeight:700, fontFamily:"Georgia, serif",
              whiteSpace:"nowrap", transition:"all .15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#8B4513"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderStyle="solid"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#fff8f0"; e.currentTarget.style.color="#8B4513"; e.currentTarget.style.borderStyle="dashed"; }}
          >
            ✏️ Produit hors mercuriale
          </button>
          <MercurialeLink />
          {/* Import mercuriale */}
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImportMercuriale}
            style={{ display:"none" }} />
          <button onClick={() => fileInputRef.current?.click()}
            style={{
              display:"inline-flex", alignItems:"center", gap:6,
              padding:"9px 16px", borderRadius:9, border:"2px solid #217346",
              background:"#f0fff4", color:"#217346", cursor:"pointer",
              fontSize:12, fontWeight:700, fontFamily:"Georgia, serif",
              whiteSpace:"nowrap", transition:"all .15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#217346"; e.currentTarget.style.color="#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background="#f0fff4"; e.currentTarget.style.color="#217346"; }}
          >
            📥 Importer mercuriale
          </button>
        </div>
        {importMsg && (
          <div style={{
            marginBottom:10, padding:"9px 14px", borderRadius:8, fontSize:12, fontWeight:600,
            background: importMsg.type === "success" ? "#f0fff4" : importMsg.type === "error" ? "#fff5f5" : "#fffde7",
            color: importMsg.type === "success" ? "#217346" : importMsg.type === "error" ? "#c0392b" : "#7D6608",
            border: `1.5px solid ${importMsg.type === "success" ? "#27ae60" : importMsg.type === "error" ? "#e74c3c" : "#f39c12"}`
          }}>
            {importMsg.text}
          </div>
        )}

        {/* Category pills */}
        <div style={{ display:"flex", gap:5, marginBottom:14, flexWrap:"wrap" }}>
          {/* Pill Favoris */}
          <button onClick={() => setFilterCat("⭐ Favoris")}
            style={{
              padding:"4px 11px", borderRadius:16,
              border: filterCat === "⭐ Favoris" ? "1px solid #F5A623" : "1px solid #F5A623",
              background: filterCat === "⭐ Favoris" ? "#F5A623" : "#FFFDE7",
              color: filterCat === "⭐ Favoris" ? "#fff" : "#B8860B",
              cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s",
              display:"flex", alignItems:"center", gap:3
            }}>
            ⭐ Favoris
            <span style={{ fontSize:9, color: filterCat === "⭐ Favoris" ? "#fff9" : "#b89878" }}>
              ({favoris.length})
            </span>
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{
                padding:"4px 11px", borderRadius:16, border:"1px solid #D4A96A",
                background: filterCat === c ? "#8B4513" : "#fff",
                color: filterCat === c ? "#fff" : "#8B4513",
                cursor:"pointer", fontSize:11, fontWeight:600, transition:"all .15s",
                display:"flex", alignItems:"center", gap:3
              }}>
              {CAT_ICONS[c] || ""} {c}
              {filterCat !== c && (
                <span style={{ fontSize:9, color:"#b89878" }}>
                  ({produits.filter(p => c === "Tous" || p.cat === c).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ fontSize:11, color:"#9B7B5A", marginBottom:10 }}>
          {filtered.length} produit(s) affiché(s) sur {produits.length}
        </div>

        {/* Product grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
          {filtered.map(product => {
            const key = (product.ref && product.name) ? `${product.ref}__${product.name}` : (product.ref || product.name);
            const inCart = cart.find(x => ((x.ref && x.name) ? `${x.ref}__${x.name}` : (x.ref || x.name)) === key);
            return (
              <div key={key} style={{
                background:"#fff", border: inCart ? "2px solid #8B4513" : "1.5px solid #EDD5B3",
                borderRadius:11, padding:12, display:"flex", flexDirection:"column", gap:5,
                boxShadow: inCart ? "0 2px 12px rgba(139,69,19,.15)" : "0 1px 6px rgba(139,69,19,.06)",
                transition:"all .15s",
              }}
                onMouseEnter={e => { if(!inCart) e.currentTarget.style.boxShadow="0 3px 14px rgba(139,69,19,.12)"; }}
                onMouseLeave={e => { if(!inCart) e.currentTarget.style.boxShadow="0 1px 6px rgba(139,69,19,.06)"; }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
                  <div style={{ flex:1 }}>
                    {product.ref && (
                      <span style={{ fontSize:9, background:"#D4A96A22", color:"#8B4513", padding:"1px 6px", borderRadius:8, fontWeight:700, display:"inline-block", marginBottom:3 }}>
                        {product.ref}
                      </span>
                    )}
                    <div style={{ fontWeight:700, fontSize:12, color:"#2C1810", lineHeight:1.35 }}>{product.name}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                    <button onClick={e => { e.stopPropagation(); toggleFavori(key); }}
                      title={favoris.includes(key) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      style={{
                        background:"none", border:"none", cursor:"pointer",
                        fontSize:16, lineHeight:1, padding:2,
                        filter: favoris.includes(key) ? "none" : "grayscale(1) opacity(0.4)",
                        transition:"all .15s"
                      }}>
                      ⭐
                    </button>
                    <span style={{ fontSize:9, background:"#f5f5f5", color:"#666", padding:"2px 6px", borderRadius:8, whiteSpace:"nowrap" }}>
                      {CAT_ICONS[product.cat]} {product.cat}
                    </span>
                  </div>
                </div>
                {product.unit && product.unit !== "1" && (
                  <div style={{ fontSize:10, color:"#9B7B5A" }}>Cond. : {product.unit}</div>
                )}
                {product.four && (
                  <div style={{ fontSize:10, color:"#7A8A6A", display:"flex", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:9 }}>🏭</span>
                    {product.four}
                  </div>
                )}
                {moyennes[key] && (
                  <div style={{ fontSize:10, color:"#5B7FA6", display:"flex", alignItems:"center", gap:3 }}>
                    <span style={{ fontSize:9 }}>📊</span>
                    Moy. 4 sem. : <strong>{moyennes[key]}</strong>
                  </div>
                )}
                {/* Panel tarifs fournisseurs */}
                {showPrixFour === key && product.prix_fournisseurs && Object.keys(product.prix_fournisseurs).length > 0 && (
                  <div style={{ background:"#FAF6F0", border:"1px solid #D4A96A", borderRadius:8, padding:"8px 10px", marginTop:4 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#8B4513", marginBottom:5 }}>Tarifs par fournisseur (HT)</div>
                    {Object.entries(product.prix_fournisseurs)
                      .sort(([,a],[,b]) => a - b)
                      .map(([four, prix]) => (
                        <div key={four} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"2px 0", borderBottom:"1px solid #EDD5B3" }}>
                          <span style={{ fontSize:10, color: four === product.four ? "#8B4513" : "#2C1810", fontWeight: four === product.four ? 700 : 400 }}>
                            {four === product.four ? "✓ " : ""}{four}
                          </span>
                          <span style={{ fontSize:11, fontWeight:700, color: four === product.four ? "#8B4513" : "#2C1810" }}>
                            {Number(prix).toFixed(2)} €
                          </span>
                        </div>
                      ))
                    }
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4, gap:6 }}>
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#2C1810" }}>{Number(product.prix_ht).toFixed(2)} € <span style={{ fontSize:10, color:"#9B7B5A", fontWeight:400 }}>HT</span></div>
                    <div style={{ fontSize:10, color:"#9B7B5A" }}>{(product.prix_ht * (1 + product.tva)).toFixed(2)} € TTC</div>
                  </div>
                  {product.prix_fournisseurs && Object.keys(product.prix_fournisseurs).length > 0 && (
                    <button onClick={() => setShowPrixFour(showPrixFour === key ? null : key)}
                      title="Voir les tarifs de tous les fournisseurs"
                      style={{
                        padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A",
                        background: showPrixFour === key ? "#8B4513" : "#fffaf5",
                        color: showPrixFour === key ? "#fff" : "#8B4513",
                        cursor:"pointer", fontSize:10, fontWeight:700, whiteSpace:"nowrap"
                      }}>
                      {showPrixFour === key ? "✕ Fermer" : "📊 Tarifs"}
                    </button>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                    {inCart ? (
                      <button onClick={() => setCart(prev => prev.filter(x => ((x.ref&&x.name)?`${x.ref}__${x.name}`:(x.ref||x.name)) !== key))}
                        style={{ padding:"5px 10px", borderRadius:7, background:"linear-gradient(135deg,#8B4513,#6B3210)", color:"#fff", border:"none", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                        ✓ ×{inCart.qty} — Retirer
                      </button>
                    ) : (
                      <>
                        <button onClick={() => setQtys(q => ({...q, [key]: Math.max(1,(q[key]||1)-1)}))}
                          style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A", background:"#fff", cursor:"pointer", fontSize:14, lineHeight:1 }}>−</button>
                        <input type="number" value={qtys[key]||1} min="1"
                          onChange={e => setQtys(q => ({...q, [key]: Math.max(1,parseInt(e.target.value)||1)}))}
                          style={{ width:44, textAlign:"center", padding:"3px 4px", border:"1px solid #D4A96A", borderRadius:6, fontSize:12, fontWeight:700, color:"#2C1810", background:"#fffaf5" }}/>
                        <button onClick={() => setQtys(q => ({...q, [key]: (q[key]||1)+1}))}
                          style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A", background:"#fff", cursor:"pointer", fontSize:14, lineHeight:1 }}>+</button>
                        <button onClick={() => { addToCart(product, qtys[key]||1); }}
                          style={{ padding:"5px 10px", borderRadius:7, background:"linear-gradient(135deg,#C4874A,#8B4513)", color:"#fff", border:"none", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                          + Ajouter
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:50, color:"#b89878" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>🔍</div>
            Aucun produit ne correspond à votre recherche.
          </div>
        )}
      </div>
      <div className="commande-cart">
        <CartPanel cart={cart} setCart={setCart} boulangerieId={boulangerieId} addToHistory={addToHistory} />
      </div>
    </div>

    {/* Barre panier fixe mobile */}
    <MobileCartBar cart={cart} boulangerieId={boulangerieId} setCart={setCart} addToHistory={addToHistory} />
    </>
  );
}

// ─── TAB HISTORIQUE ──────────────────────────────────────────────────────────
const FOURNISSEURS_LIST = [
  "BackEurop THOMAS", "Fuseau", "Millepieds", "Minoterie Girardeau",
  "PAP", "Richard Distribution", "SCV", "Supergroup",
  "TeamOuest France Frais", "Terre et marée", "TransGourmet", "Veolia"
];

function genererBonsFournisseurs(cmd, items) {
  // Grouper les produits par fournisseur
  const groupes = {};
  items.forEach(item => {
    const four = item.four || "Fournisseur non renseigné";
    if (!groupes[four]) groupes[four] = [];
    groupes[four].push(item);
  });

  Object.entries(groupes).forEach(([fournisseur, produits]) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = 210;
    const marge = 18;
    let y = 0;

    // ── Fond header ──
    doc.setFillColor(44, 24, 16);
    doc.rect(0, 0, W, 42, "F");

    // Logo texte (le vrai logo nécessiterait une conversion base64)
    doc.setTextColor(212, 169, 106);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PENSE AU PAIN", marge, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 140, 90);
    doc.text("BOULANGERIE — PÂTISSERIE", marge, 22);

    // Boulangerie commandante
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(cmd.boulangerie, marge, 32);

    // Bloc fournisseur (droite)
    doc.setFillColor(60, 35, 20);
    doc.roundedRect(W - 80, 6, 64, 30, 3, 3, "F");
    doc.setTextColor(212, 169, 106);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("FOURNISSEUR", W - 77, 14);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(fournisseur, W - 77, 21, { maxWidth: 58 });

    y = 52;

    // ── Infos commande ──
    doc.setFillColor(255, 248, 240);
    doc.rect(marge, y, W - marge * 2, 18, "F");
    doc.setDrawColor(212, 169, 106);
    doc.setLineWidth(0.4);
    doc.rect(marge, y, W - marge * 2, 18);

    doc.setTextColor(44, 24, 16);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("N° Commande :", marge + 4, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(cmd.id, marge + 38, y + 7);

    doc.setFont("helvetica", "bold");
    doc.text("Date :", marge + 4, y + 13);
    doc.setFont("helvetica", "normal");
    doc.text(fmtDate(cmd.date), marge + 38, y + 13);

    doc.setFont("helvetica", "bold");
    doc.text("Statut :", W / 2, y + 7);
    doc.setFont("helvetica", "normal");
    doc.text(cmd.status, W / 2 + 18, y + 7);

    doc.setFont("helvetica", "bold");
    doc.text("Articles :", W / 2, y + 13);
    doc.setFont("helvetica", "normal");
    doc.text(`${produits.length} produit(s)`, W / 2 + 18, y + 13);

    y += 26;

    // ── Titre tableau ──
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 24, 16);
    doc.text(`BON DE COMMANDE — ${fournisseur.toUpperCase()}`, marge, y);
    y += 6;

    // ── En-têtes colonnes ──
    doc.setFillColor(44, 24, 16);
    doc.rect(marge, y, W - marge * 2, 8, "F");
    doc.setTextColor(212, 169, 106);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const cols = [
      { label: "Réf.",      x: marge + 2,   w: 22 },
      { label: "Désignation", x: marge + 24, w: 80 },
      { label: "Cond.",     x: marge + 104,  w: 22 },
      { label: "Qté",       x: marge + 126,  w: 14 },
      { label: "P.U. HT",   x: marge + 140,  w: 24 },
      { label: "Total HT",  x: marge + 164,  w: 10 },
    ];
    cols.forEach(c => doc.text(c.label, c.x, y + 5.5));
    y += 8;

    // ── Lignes produits ──
    doc.setFont("helvetica", "normal");
    let totalHT = 0;
    produits.forEach((item, i) => {
      const rowH = 7;
      // alternance
      if (i % 2 === 0) {
        doc.setFillColor(255, 250, 245);
        doc.rect(marge, y, W - marge * 2, rowH, "F");
      }
      doc.setDrawColor(230, 210, 180);
      doc.setLineWidth(0.2);
      doc.line(marge, y + rowH, W - marge, y + rowH);

      const ligneHT = item.prix_ht * item.qty;
      totalHT += ligneHT;

      doc.setTextColor(44, 24, 16);
      doc.setFontSize(7.5);
      doc.text(item.ref || "—",                   cols[0].x, y + 4.8);
      doc.text(item.name.substring(0, 45),        cols[1].x, y + 4.8);
      doc.text(item.unit || "—",                  cols[2].x, y + 4.8);
      doc.setFont("helvetica", "bold");
      doc.text(String(item.qty),                  cols[3].x, y + 4.8);
      doc.setFont("helvetica", "normal");
      doc.text(fmt(item.prix_ht),                 cols[4].x, y + 4.8);
      doc.setFont("helvetica", "bold");
      doc.text(fmt(ligneHT),                      cols[5].x, y + 4.8);
      doc.setFont("helvetica", "normal");

      y += rowH;

      // Nouvelle page si besoin
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
    });

    // ── Totaux ──
    y += 4;
    const totalTTC = totalHT * 1.055;

    doc.setFillColor(255, 248, 240);
    doc.setDrawColor(212, 169, 106);
    doc.setLineWidth(0.5);
    doc.rect(W - marge - 70, y, 70, 22, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 70, 40);
    doc.text("Total HT :", W - marge - 66, y + 7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 24, 16);
    doc.text(fmt(totalHT), W - marge - 8, y + 7, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 70, 40);
    doc.text("TVA (5,5%) :", W - marge - 66, y + 13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 24, 16);
    doc.text(fmt(totalHT * 0.055), W - marge - 8, y + 13, { align: "right" });

    doc.setFillColor(44, 24, 16);
    doc.rect(W - marge - 70, y + 16, 70, 8, "F");
    doc.setTextColor(212, 169, 106);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL TTC :", W - marge - 66, y + 21.5);
    doc.text(fmt(totalTTC), W - marge - 8, y + 21.5, { align: "right" });

    // ── Pied de page ──
    doc.setTextColor(180, 160, 140);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Document généré le ${new Date().toLocaleDateString("fr-FR")} — Pense Au Pain`,
      W / 2, 290, { align: "center" }
    );

    // Téléchargement
    const nomFichier = `bon-commande_${cmd.id}_${fournisseur.replace(/\s+/g, "-")}.pdf`;
    doc.save(nomFichier);
  });
}

function DetailCommande({ cmd, onClose, onUpdateStatus, onUpdateCommande }) {
  let initialItems = [];
  try {
    initialItems = typeof cmd.detail === "string" ? JSON.parse(cmd.detail) : (cmd.detail || []);
  } catch(e) { initialItems = []; }

  const [items, setItems] = useState(initialItems);
  const [editingFour, setEditingFour] = useState(null);
  const [viewMode, setViewMode] = useState("liste"); // "liste" ou "fournisseur"
  const statusColor = { "Livré": "#217346", "En cours": "#E67E22", "Annulé": "#C0392B" };
  const statuts = ["En cours", "Livré", "Annulé"];
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus) => {
    if (newStatus === cmd.status) return;
    setUpdating(true);
    await onUpdateStatus(cmd.id, newStatus);
    setUpdating(false);
    onClose();
  };

  const handleChangeFour = async (index, newFour) => {
    const newItems = items.map((item, i) => i === index ? { ...item, four: newFour } : item);
    setItems(newItems);
    setEditingFour(null);
    // Sauvegarde dans Google Sheets
    if (onUpdateCommande) {
      await onUpdateCommande({ ...cmd, detail: newItems });
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center"
    }}>
      <div style={{
        background:"#fff", borderRadius:16, padding:28, width:700, maxWidth:"95vw",
        maxHeight:"88vh", display:"flex", flexDirection:"column",
        boxShadow:"0 8px 40px rgba(0,0,0,.25)", border:"2px solid #D4A96A"
      }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <h3 style={{ margin:0, fontFamily:"Georgia", color:"#2C1810", fontSize:16 }}>📋 {cmd.id}</h3>
            <div style={{ fontSize:12, color:"#9B7B5A", marginTop:4 }}>{fmtDate(cmd.date)} · {cmd.boulangerie}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ padding:"4px 12px", borderRadius:12, background:statusColor[cmd.status]+"22", color:statusColor[cmd.status], fontSize:11, fontWeight:700 }}>{cmd.status}</span>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9B7B5A" }}>✕</button>
          </div>
        </div>

        {/* Changer le statut */}
        <div style={{ background:"#fffaf5", border:"1.5px solid #EDD5B3", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#7A5C3A", marginBottom:8, fontFamily:"Georgia" }}>🔄 Changer le statut</div>
          <div style={{ display:"flex", gap:8 }}>
            {statuts.map(s => (
              <button key={s} onClick={() => handleStatus(s)} disabled={updating || s === cmd.status}
                style={{
                  flex:1, padding:"8px 0", borderRadius:8, border:"2px solid",
                  borderColor: s === cmd.status ? statusColor[s] : "#EDD5B3",
                  background: s === cmd.status ? statusColor[s]+"22" : "#fff",
                  color: s === cmd.status ? statusColor[s] : "#9B7B5A",
                  cursor: s === cmd.status ? "default" : "pointer",
                  fontSize:12, fontWeight:700, transition:"all .15s", opacity: updating ? 0.6 : 1
                }}
                onMouseEnter={e => { if(s !== cmd.status && !updating) { e.currentTarget.style.background=statusColor[s]+"22"; e.currentTarget.style.borderColor=statusColor[s]; e.currentTarget.style.color=statusColor[s]; }}}
                onMouseLeave={e => { if(s !== cmd.status) { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#EDD5B3"; e.currentTarget.style.color="#9B7B5A"; }}}
              >
                {s === "Livré" ? "✅" : s === "En cours" ? "🚚" : "❌"} {s}{s === cmd.status && " ✓"}
              </button>
            ))}
          </div>
          {updating && <div style={{ fontSize:11, color:"#E67E22", marginTop:8, textAlign:"center" }}>⏳ Mise à jour en cours…</div>}
        </div>

        {/* Toggle vue + Liste des produits */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {items.length === 0 ? (
            <p style={{ color:"#b89878", textAlign:"center", padding:20 }}>Détail non disponible pour cette commande.</p>
          ) : (
            <>
              {/* Toggle */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontSize:11, color:"#9B7B5A" }}>
                  💡 Cliquez sur le fournisseur pour le modifier
                </div>
                <div style={{ display:"flex", gap:0, borderRadius:8, overflow:"hidden", border:"1.5px solid #D4A96A" }}>
                  {[["liste","📋 Liste"],["fournisseur","🏭 Par fournisseur"]].map(([mode, label]) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      style={{
                        padding:"5px 12px", border:"none", cursor:"pointer", fontSize:11, fontWeight:700,
                        background: viewMode===mode ? "#8B4513" : "#fff",
                        color: viewMode===mode ? "#fff" : "#8B4513",
                        fontFamily:"Georgia, serif", transition:"all .15s"
                      }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Vue liste */}
              {viewMode === "liste" && (
                <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 4px" }}>
                  <thead>
                    <tr>
                      {["Réf.","Produit","Qté","Prix HT","Fournisseur"].map(h => (
                        <th key={h} style={{ padding:"8px 12px", textAlign:"left", background:"#2C1810", color:"#D4A96A", fontSize:11, fontFamily:"Georgia" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ background: i%2===0 ? "#fffaf5" : "#fff" }}>
                        <td style={{ padding:"8px 12px", fontSize:10, color:"#8B4513", fontFamily:"monospace", borderRadius:"6px 0 0 6px" }}>{item.ref || "—"}</td>
                        <td style={{ padding:"8px 12px", fontSize:12, color:"#2C1810", fontWeight:600 }}>{item.name}</td>
                        <td style={{ padding:"8px 12px", fontSize:12, color:"#2C1810", textAlign:"center", fontWeight:700 }}>×{item.qty}</td>
                        <td style={{ padding:"8px 12px", fontSize:12, color:"#7A5C3A" }}>{fmt(item.prix_ht)}</td>
                        <td style={{ padding:"8px 12px", borderRadius:"0 6px 6px 0" }}>
                          {editingFour === i ? (
                            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                              <select autoFocus defaultValue={item.four || ""}
                                onChange={e => handleChangeFour(i, e.target.value)}
                                style={{ padding:"4px 8px", border:"2px solid #D4A96A", borderRadius:6, background:"#fffaf5", color:"#2C1810", fontSize:11, cursor:"pointer", outline:"none", flex:1 }}
                              >
                                <option value="">— Choisir —</option>
                                {FOURNISSEURS_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                              <button onClick={() => setEditingFour(null)}
                                style={{ background:"none", border:"none", cursor:"pointer", color:"#9B7B5A", fontSize:14 }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setEditingFour(i)}
                              title="Cliquer pour modifier le fournisseur"
                              style={{
                                display:"inline-flex", alignItems:"center", gap:5,
                                padding:"4px 10px", borderRadius:12,
                                background:"#f0f4ff", border:"1.5px dashed #A0B0D0",
                                color:"#3A5A9B", fontSize:11, fontWeight:600,
                                cursor:"pointer", transition:"all .15s"
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background="#3A5A9B"; e.currentTarget.style.color="#fff"; e.currentTarget.style.borderStyle="solid"; }}
                              onMouseLeave={e => { e.currentTarget.style.background="#f0f4ff"; e.currentTarget.style.color="#3A5A9B"; e.currentTarget.style.borderStyle="dashed"; }}
                            >
                              🏭 {item.four || "Non renseigné"} ✎
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Vue par fournisseur */}
              {viewMode === "fournisseur" && (() => {
                const groupes = {};
                items.forEach(item => {
                  const four = item.four || "Non renseigné";
                  if (!groupes[four]) groupes[four] = [];
                  groupes[four].push(item);
                });
                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    {Object.entries(groupes).sort(([a],[b]) => a.localeCompare(b)).map(([four, produits]) => {
                      const totalHT = produits.reduce((s,p) => s + (p.prix_ht||0) * p.qty, 0);
                      return (
                        <div key={four} style={{ border:"1.5px solid #D4A96A", borderRadius:10, overflow:"hidden" }}>
                          {/* Header fournisseur */}
                          <div style={{ background:"#2C1810", padding:"8px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ color:"#D4A96A", fontWeight:700, fontSize:13, fontFamily:"Georgia" }}>🏭 {four}</span>
                            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                              <span style={{ color:"#EDD5B3", fontSize:11 }}>{produits.length} article(s)</span>
                              <span style={{ color:"#fff", fontWeight:700, fontSize:12 }}>{fmt(totalHT)} HT</span>
                            </div>
                          </div>
                          {/* Produits */}
                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                            <thead>
                              <tr style={{ background:"#FAF6F0" }}>
                                {["Réf.","Produit","Qté","Prix HT","Total HT"].map(h => (
                                  <th key={h} style={{ padding:"6px 12px", textAlign:"left", fontSize:10, color:"#8B4513", fontWeight:700 }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {produits.map((item, i) => (
                                <tr key={i} style={{ borderTop:"1px solid #EDD5B3" }}>
                                  <td style={{ padding:"7px 12px", fontSize:10, color:"#8B4513", fontFamily:"monospace" }}>{item.ref || "—"}</td>
                                  <td style={{ padding:"7px 12px", fontSize:12, color:"#2C1810", fontWeight:600 }}>{item.name}</td>
                                  <td style={{ padding:"7px 12px", fontSize:12, textAlign:"center", fontWeight:700, color:"#2C1810" }}>×{item.qty}</td>
                                  <td style={{ padding:"7px 12px", fontSize:12, color:"#7A5C3A" }}>{fmt(item.prix_ht)}</td>
                                  <td style={{ padding:"7px 12px", fontSize:12, fontWeight:700, color:"#2C1810" }}>{fmt((item.prix_ht||0)*item.qty)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                    {/* Total global */}
                    <div style={{ display:"flex", justifyContent:"flex-end", padding:"8px 4px", borderTop:"2px solid #D4A96A", marginTop:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, color:"#2C1810", fontFamily:"Georgia" }}>
                        Total HT : {fmt(items.reduce((s,i) => s+(i.prix_ht||0)*i.qty, 0))}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer total + bouton PDF */}
        {items.length > 0 && (
          <div style={{ borderTop:"2px solid #EDD5B3", marginTop:14, paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <span style={{ fontSize:12, color:"#7A5C3A" }}>
              {items.length} article(s) · Total HT : {fmt(items.reduce((s,i) => s + i.prix_ht * i.qty, 0))}
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              {(() => {
                const fours = [...new Set(items.map(i => i.four || "Non renseigné"))];
                return <span style={{ fontSize:11, color:"#9B7B5A" }}>{fours.length} fournisseur(s) : {fours.join(", ")}</span>;
              })()}
              <button onClick={() => genererBonsFournisseurs(cmd, items)}
                style={{
                  display:"inline-flex", alignItems:"center", gap:6,
                  padding:"9px 18px", borderRadius:9, border:"none",
                  background:"linear-gradient(135deg,#8B4513,#6B3210)",
                  color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700,
                  fontFamily:"Georgia, serif", boxShadow:"0 3px 12px rgba(139,69,19,.35)", transition:"opacity .15s"
                }}
                onMouseEnter={e => e.currentTarget.style.opacity=".85"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >
                📄 Générer les bons fournisseurs
              </button>
              <span style={{ fontSize:15, fontWeight:800, color:"#2C1810", fontFamily:"Georgia" }}>{fmt(cmd.total)} TTC</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function ModifierCommande({ cmd, onClose, onSave }) {
  let initialItems = [];
  try {
    initialItems = typeof cmd.detail === "string" ? JSON.parse(cmd.detail) : (cmd.detail || []);
  } catch(e) { initialItems = []; }

  const [items, setItems] = useState(initialItems.map(i => ({ ...i })));
  const [boulangerie, setBoulangerie] = useState(cmd.boulangerie);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const totalTTC = items.reduce((s, i) => s + i.prix_ht * (1 + (i.tva || 0.055)) * i.qty, 0);
  const removeItem = (key) => setItems(prev => prev.filter(i => (i.ref || i.name) !== key));
  const changeQty = (key, delta) => setItems(prev => prev.map(i =>
    (i.ref || i.name) === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i
  ));

  const suggestions = search.length >= 2
    ? ALL_PRODUCTS.filter(p =>
        (p.name.toLowerCase().includes(search.toLowerCase()) || (p.ref||"").toLowerCase().includes(search.toLowerCase())) &&
        !items.find(i => (i.ref || i.name) === (p.ref || p.name))
      ).slice(0, 8)
    : [];

  const addProduct = (p) => { setItems(prev => [...prev, { ...p, qty: 1 }]); setSearch(""); };

  const handleSave = async () => {
    if (items.length === 0) return;
    setSaving(true);
    await onSave({ ...cmd, boulangerie, items: items.length, total: totalTTC, detail: items });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:740, maxWidth:"96vw", maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 8px 40px rgba(0,0,0,.3)", border:"2px solid #D4A96A" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <div>
            <h3 style={{ margin:0, fontFamily:"Georgia", color:"#2C1810", fontSize:17 }}>✏️ Modifier la commande</h3>
            <div style={{ fontSize:12, color:"#9B7B5A", marginTop:3 }}>{cmd.id} · {fmtDate(cmd.date)}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9B7B5A" }}>✕</button>
        </div>

        {/* Boulangerie */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#7A5C3A", display:"block", marginBottom:5, fontFamily:"Georgia" }}>🏪 Boulangerie</label>
          <select value={boulangerie} onChange={e => setBoulangerie(e.target.value)}
            style={{ padding:"8px 14px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", color:"#2C1810", fontSize:12, cursor:"pointer", outline:"none", minWidth:280 }}>
            {BOULANGERIES.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>

        {/* Ajouter un produit */}
        <div style={{ marginBottom:14, position:"relative" }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#7A5C3A", display:"block", marginBottom:5, fontFamily:"Georgia" }}>➕ Ajouter un produit</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou référence…"
            style={{ width:"100%", padding:"9px 14px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:12, outline:"none", boxSizing:"border-box" }}
          />
          {suggestions.length > 0 && (
            <div style={{ position:"absolute", top:"100%", left:0, right:0, background:"#fff", border:"2px solid #D4A96A", borderRadius:8, boxShadow:"0 4px 20px rgba(0,0,0,.15)", zIndex:10, maxHeight:200, overflowY:"auto" }}>
              {suggestions.map(p => (
                <div key={p.ref || p.name} onClick={() => addProduct(p)}
                  style={{ padding:"8px 14px", cursor:"pointer", borderBottom:"1px solid #f0e8d8", display:"flex", justifyContent:"space-between", alignItems:"center" }}
                  onMouseEnter={e => e.currentTarget.style.background="#fffaf5"}
                  onMouseLeave={e => e.currentTarget.style.background="#fff"}
                >
                  <span style={{ fontSize:12, color:"#2C1810", fontWeight:600 }}>{p.name}</span>
                  <span style={{ fontSize:11, color:"#9B7B5A" }}>{fmt(p.prix_ht)} HT · {p.four}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liste produits */}
        <div style={{ flex:1, overflowY:"auto", marginBottom:14 }}>
          {items.length === 0 ? (
            <p style={{ textAlign:"center", color:"#b89878", padding:20 }}>Aucun article — ajoutez des produits ci-dessus</p>
          ) : (
            <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:"0 4px" }}>
              <thead>
                <tr>{["Réf.","Produit","Fournisseur","Qté","Prix HT","Total HT",""].map(h => (
                  <th key={h} style={{ padding:"7px 10px", textAlign:"left", background:"#2C1810", color:"#D4A96A", fontSize:10, fontFamily:"Georgia" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const key = item.ref || item.name;
                  return (
                    <tr key={key} style={{ background: i%2===0 ? "#fffaf5" : "#fff" }}>
                      <td style={{ padding:"7px 10px", fontSize:10, color:"#8B4513", fontFamily:"monospace", borderRadius:"6px 0 0 6px" }}>{item.ref || "—"}</td>
                      <td style={{ padding:"7px 10px", fontSize:11, color:"#2C1810", fontWeight:600 }}>{item.name}</td>
                      <td style={{ padding:"7px 10px", fontSize:10, color:"#7A5C3A" }}>{item.four || "—"}</td>
                      <td style={{ padding:"7px 10px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <button onClick={() => changeQty(key, -1)} style={{ width:22, height:22, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:13 }}>−</button>
                          <span style={{ width:24, textAlign:"center", fontSize:12, fontWeight:700 }}>{item.qty}</span>
                          <button onClick={() => changeQty(key, +1)} style={{ width:22, height:22, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:13 }}>+</button>
                        </div>
                      </td>
                      <td style={{ padding:"7px 10px", fontSize:11, color:"#7A5C3A" }}>{fmt(item.prix_ht)}</td>
                      <td style={{ padding:"7px 10px", fontSize:11, fontWeight:700, color:"#2C1810" }}>{fmt(item.prix_ht * item.qty)}</td>
                      <td style={{ padding:"7px 10px", borderRadius:"0 6px 6px 0" }}>
                        <button onClick={() => removeItem(key)} style={{ background:"#fde8e8", border:"none", color:"#c0392b", borderRadius:5, width:22, height:22, cursor:"pointer", fontSize:12, fontWeight:700 }}>✕</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop:"2px solid #EDD5B3", paddingTop:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#7A5C3A" }}>
            {items.length} article(s) · <strong style={{ color:"#2C1810" }}>{fmt(totalTTC)} TTC</strong>
          </span>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} style={{ padding:"9px 20px", borderRadius:9, border:"2px solid #D4A96A", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:12, fontWeight:700 }}>
              Annuler
            </button>
            <button onClick={handleSave} disabled={saving || items.length === 0}
              style={{ padding:"9px 24px", borderRadius:9, border:"none", background: items.length === 0 ? "#ccc" : "linear-gradient(135deg,#8B4513,#6B3210)", color:"#fff", cursor: items.length === 0 ? "default" : "pointer", fontSize:12, fontWeight:700, fontFamily:"Georgia", boxShadow:"0 3px 12px rgba(139,69,19,.3)", transition:"opacity .15s" }}
              onMouseEnter={e => { if(items.length > 0) e.currentTarget.style.opacity=".85"; }}
              onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              {saving ? "⏳ Sauvegarde…" : "💾 Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB EMBALLAGES ──────────────────────────────────────────────────────────
const STYLES_EMB = ["Pense Au Pain", "La Pause"];
const STYLE_COLORS = { "Pense Au Pain": { bg:"#EEF4FF", border:"#4A7FD4", text:"#1A4A9B" }, "La Pause": { bg:"#FFF3E8", border:"#D4834A", text:"#8B3A10" } };

function ModalAjoutEmballage({ onClose, onSave }) {
  const [form, setForm] = useState({ ref:"", name:"", style:"Pense Au Pain", unit:"", prix_ht:"", stock:"0" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.ref || !form.name) return alert("Référence et nom obligatoires");
    onSave({ ...form, prix_ht: parseFloat(form.prix_ht) || 0, stock: parseInt(form.stock) || 0 });
    onClose();
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:28, width:440, maxWidth:"92vw", boxShadow:"0 8px 40px rgba(0,0,0,.25)", border:"2px solid #D4A96A" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ margin:0, fontFamily:"Georgia", color:"#2C1810", fontSize:16 }}>➕ Nouvel emballage</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9B7B5A" }}>✕</button>
        </div>
        {[
          { label:"Référence *", key:"ref", placeholder:"ex: EMB-001" },
          { label:"Nom *",       key:"name", placeholder:"ex: Sac kraft 18cm" },
          { label:"Unité",       key:"unit", placeholder:"ex: Carton de 500" },
          { label:"Prix HT (€)", key:"prix_ht", placeholder:"ex: 12.50", type:"number" },
          { label:"Stock initial", key:"stock", placeholder:"ex: 100", type:"number" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, fontWeight:700, color:"#7A5C3A", display:"block", marginBottom:4 }}>{f.label}</label>
            <input type={f.type || "text"} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{ width:"100%", padding:"9px 12px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:12, outline:"none", boxSizing:"border-box" }} />
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:"#7A5C3A", display:"block", marginBottom:4 }}>Style</label>
          <div style={{ display:"flex", gap:8 }}>
            {STYLES_EMB.map(s => {
              const c = STYLE_COLORS[s];
              return (
                <button key={s} onClick={() => set("style", s)}
                  style={{ flex:1, padding:"9px", borderRadius:8, border:`2px solid ${form.style===s ? c.border : "#EDD5B3"}`, background: form.style===s ? c.bg : "#fff", color: form.style===s ? c.text : "#9B7B5A", cursor:"pointer", fontSize:12, fontWeight:700, transition:"all .15s" }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:9, border:"2px solid #D4A96A", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:12, fontWeight:700 }}>Annuler</button>
          <button onClick={handleSave} style={{ flex:2, padding:"10px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#8B4513,#6B3210)", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"Georgia" }}>💾 Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function CartPanelEmballages({ cart, setCart, boulangerieId, onCommander }) {
  const boulangerieNom = BOULANGERIES.find(b => b.id === boulangerieId)?.name || "";
  const totalHT = cart.reduce((s, i) => s + (parseFloat(i.prix_ht)||0) * i.qty, 0);
  const totalTTC = totalHT * 1.2;

  const setQty = (ref, val) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 1) return;
    setCart(c => c.map(x => x.ref === ref ? { ...x, qty: n } : x));
  };

  const handleCommander = () => {
    if (!boulangerieId || cart.length === 0) return;
    const cmd = {
      id: `EMB-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`,
      date: today(), boulangerie: boulangerieNom,
      type: "Emballages",
      items: cart.length, total: totalTTC, status:"En cours",
      detail: cart.map(i => ({ ...i }))
    };
    onCommander(cmd);
    setCart([]);
    alert(`✅ Commande ${cmd.id} passée — ${cart.length} référence(s)`);
  };


  return (
    <div style={{ background:"#fffaf5", border:"2px solid #D4A96A", borderRadius:14, padding:18, minWidth:270, maxWidth:300, position:"sticky", top:20, boxShadow:"0 4px 20px rgba(139,69,19,.10)", flexShrink:0 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontWeight:700, fontSize:14, color:"#2C1810", fontFamily:"Georgia" }}>🧺 Panier ({cart.reduce((s,i)=>s+i.qty,0)})</span>
        {cart.length > 0 && <button onClick={() => setCart([])} style={{ background:"none", border:"none", cursor:"pointer", color:"#c0392b", fontSize:11, fontWeight:600 }}>Vider</button>}
      </div>

      {cart.length === 0 ? (
        <p style={{ color:"#b89878", fontSize:12, textAlign:"center", padding:"20px 0", margin:0 }}>Aucun article</p>
      ) : (
        <div style={{ maxHeight:360, overflowY:"auto", display:"flex", flexDirection:"column", gap:7 }}>
          {cart.map(item => (
            <div key={item.ref} style={{ padding:"8px 10px", background:"#fff", borderRadius:8, border:"1px solid #EDD5B3" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:4, marginBottom:5 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#2C1810", lineHeight:1.3 }}>{item.name}</div>
                  <div style={{ fontSize:10, color:"#9B7B5A" }}>{fmt(parseFloat(item.prix_ht)||0)} HT/carton</div>
                  {item.unit && parseInt(item.unit) > 1 && (
                    <div style={{ fontSize:10, color:"#D4834A", fontWeight:600 }}>📦 1 carton = {parseInt(item.unit)} unités</div>
                  )}
                </div>
                <button onClick={() => setCart(c => c.filter(x => x.ref !== item.ref))}
                  style={{ border:"none", background:"#fde8e8", color:"#c0392b", borderRadius:4, width:18, height:18, cursor:"pointer", fontSize:10, flexShrink:0 }}>✕</button>
              </div>
              {/* Saisie quantité avec +/− ET input direct */}
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <button onClick={() => setCart(c => c.map(x => x.ref===item.ref ? {...x, qty:Math.max(1,x.qty-1)} : x))}
                  style={{ width:24, height:24, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:14, lineHeight:1 }}>−</button>
                <input
                  type="number" min="1" value={item.qty}
                  onChange={e => setQty(item.ref, e.target.value)}
                  style={{ width:44, height:24, textAlign:"center", border:"1px solid #D4A96A", borderRadius:5, fontSize:13, fontWeight:700, color:"#2C1810", outline:"none", padding:0 }}
                />
                <button onClick={() => setCart(c => c.map(x => x.ref===item.ref ? {...x, qty:x.qty+1} : x))}
                  style={{ width:24, height:24, borderRadius:5, border:"1px solid #D4A96A", background:"#fff8f0", cursor:"pointer", fontSize:14, lineHeight:1 }}>+</button>
                <span style={{ fontSize:11, color:"#9B7B5A", marginLeft:2 }}>= {fmt((parseFloat(item.prix_ht)||0) * item.qty)} HT</span>
                {item.unit && parseInt(item.unit) > 1 && (
                  <span style={{ fontSize:10, color:"#217346", marginLeft:4, fontWeight:600 }}>
                    (−{item.qty * parseInt(item.unit)} unités stock)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <>
          <div style={{ borderTop:"1px dashed #D4A96A", marginTop:10, paddingTop:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7A5C3A", marginBottom:3 }}>
              <span>Total HT</span><span>{fmt(totalHT)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#7A5C3A", marginBottom:3 }}>
              <span>TVA (20%)</span><span>{fmt(totalHT * 0.2)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:14, fontWeight:700, color:"#2C1810" }}>
              <span>Total TTC</span><span>{fmt(totalTTC)}</span>
            </div>
          </div>
          <button onClick={handleCommander} disabled={!boulangerieId}
            style={{ width:"100%", marginTop:10, padding:"10px 0", background: boulangerieId ? "linear-gradient(135deg,#8B4513,#6B3210)" : "#ccc", color:"#fff", border:"none", borderRadius:9, cursor: boulangerieId ? "pointer" : "not-allowed", fontWeight:700, fontSize:12, fontFamily:"Georgia", boxShadow: boulangerieId ? "0 3px 12px rgba(139,69,19,.35)" : "none" }}>
            {boulangerieId ? "✅ Valider la commande" : "Choisir une boulangerie"}
          </button>
        </>
      )}
    </div>
  );
}

function TabEmballages({ emballages, boulangerieId, isAdmin, onAjouter, onModifierStock, onCommander }) {
  const [cart, setCart] = useState([]);
  const [filterStyle, setFilterStyle] = useState("Tous");
  const [showModal, setShowModal] = useState(false);
  const [editStock, setEditStock] = useState(null);

  const filtered = filterStyle === "Tous" ? emballages : emballages.filter(e => e.style === filterStyle);

  const addToCart = (emb) => {
    setCart(prev => {
      const ex = prev.find(x => x.ref === emb.ref);
      if (ex) return prev.map(x => x.ref === emb.ref ? { ...x, qty: x.qty+1 } : x);
      return [...prev, { ...emb, qty:1 }];
    });
  };

  const stockColor = (s) => {
    const n = Number(s);
    if (n <= 0) return { bg:"#fde8e8", color:"#c0392b", label:"Rupture" };
    if (n <= 10) return { bg:"#FFF3CD", color:"#E67E22", label:"Stock bas" };
    return { bg:"#e8f8e8", color:"#217346", label:"En stock" };
  };

  return (
    <>
    {showModal && <ModalAjoutEmballage onClose={() => setShowModal(false)} onSave={onAjouter} />}

    {/* Toolbar */}
    <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
      <div style={{ display:"flex", gap:6 }}>
        {["Tous", ...STYLES_EMB].map(s => {
          const c = s !== "Tous" ? STYLE_COLORS[s] : null;
          const active = filterStyle === s;
          return (
            <button key={s} onClick={() => setFilterStyle(s)}
              style={{ padding:"7px 14px", borderRadius:8, border:`2px solid ${active ? (c?.border || "#8B4513") : "#EDD5B3"}`, background: active ? (c?.bg || "#fffaf5") : "#fff", color: active ? (c?.text || "#8B4513") : "#9B7B5A", cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s" }}>
              {s}
            </button>
          );
        })}
      </div>
      <span style={{ fontSize:11, color:"#9B7B5A" }}>{filtered.length} référence(s)</span>
      {isAdmin && (
        <button onClick={() => setShowModal(true)}
          style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#8B4513,#6B3210)", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700 }}>
          ➕ Ajouter un emballage
        </button>
      )}
    </div>

    {/* Layout grille + panier */}
    <div className="commande-layout">
      <div className="commande-products">
        {/* Grille emballages */}
        {emballages.length === 0 ? (
          <div style={{ textAlign:"center", padding:40, color:"#b89878" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>📦</div>
            {isAdmin ? "Aucun emballage — cliquez sur ➕ pour en ajouter" : "Catalogue en cours de création…"}
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 }}>
            {filtered.map(emb => {
              const c = STYLE_COLORS[emb.style] || STYLE_COLORS["Pense Au Pain"];
              const sc = stockColor(emb.stock);
              const inCart = cart.find(x => x.ref === emb.ref);
              return (
                <div key={emb.ref} style={{ background:"#fff", border:`2px solid ${inCart ? c.border : "#EDD5B3"}`, borderRadius:12, padding:14, boxShadow: inCart ? `0 0 0 3px ${c.border}44` : "0 2px 8px rgba(0,0,0,.06)", transition:"all .15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                    <span style={{ padding:"3px 9px", borderRadius:8, background:c.bg, color:c.text, fontSize:10, fontWeight:700, border:`1px solid ${c.border}` }}>{emb.style}</span>
                    <span style={{ padding:"3px 9px", borderRadius:8, background:sc.bg, color:sc.color, fontSize:10, fontWeight:700 }}>{sc.label}</span>
                  </div>
                  <div style={{ fontSize:10, color:"#9B7B5A", fontFamily:"monospace", marginBottom:3 }}>{emb.ref}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#2C1810", marginBottom:4, lineHeight:1.3 }}>{emb.name}</div>
                  {emb.unit && <div style={{ fontSize:11, color:"#7A5C3A", marginBottom:4 }}>📦 {emb.unit}</div>}

                  {/* Stock */}
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                    <span style={{ fontSize:11, color:"#9B7B5A" }}>Stock :</span>
                    {isAdmin && editStock?.ref === emb.ref ? (
                      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                        <input type="number" value={editStock.value} onChange={e => setEditStock(v => ({ ...v, value: e.target.value }))}
                          style={{ width:60, padding:"3px 6px", border:"2px solid #D4A96A", borderRadius:6, fontSize:12, outline:"none" }} />
                        <button onClick={() => { onModifierStock(emb.ref, parseInt(editStock.value)||0); setEditStock(null); }}
                          style={{ padding:"3px 8px", borderRadius:5, border:"none", background:"#217346", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700 }}>✓</button>
                        <button onClick={() => setEditStock(null)}
                          style={{ padding:"3px 6px", borderRadius:5, border:"none", background:"#eee", cursor:"pointer", fontSize:11 }}>✕</button>
                      </div>
                    ) : (
                      <span style={{ fontWeight:700, color:sc.color, fontSize:13 }}>{emb.stock ?? "—"}
                        {isAdmin && <button onClick={() => setEditStock({ ref:emb.ref, value: emb.stock ?? 0 })}
                          style={{ marginLeft:6, background:"none", border:"none", cursor:"pointer", fontSize:11, color:"#9B7B5A" }}>✎</button>}
                      </span>
                    )}
                  </div>

                  {/* Prix + bouton */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#2C1810" }}>{emb.prix_ht > 0 ? fmt(emb.prix_ht) : "—"} HT</div>
                      {emb.prix_ht > 0 && <div style={{ fontSize:10, color:"#9B7B5A" }}>{fmt(emb.prix_ht * 1.2)} TTC</div>}
                    </div>
                    {inCart ? (
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                        <button onClick={() => setCart(c => c.map(x => x.ref===emb.ref ? {...x,qty:Math.max(1,x.qty-1)} : x))}
                          style={{ width:26,height:26,borderRadius:6,border:"1px solid #D4A96A",background:"#fff8f0",cursor:"pointer",fontSize:14 }}>−</button>
                        <input type="number" min="1" value={inCart.qty}
                          onChange={e => { const n=parseInt(e.target.value); if(!isNaN(n)&&n>=1) setCart(c=>c.map(x=>x.ref===emb.ref?{...x,qty:n}:x)); }}
                          style={{ width:38,height:26,textAlign:"center",border:"1px solid #D4A96A",borderRadius:5,fontSize:12,fontWeight:700,color:"#2C1810",outline:"none",padding:0 }} />
                        <button onClick={() => setCart(c => c.map(x => x.ref===emb.ref ? {...x,qty:x.qty+1} : x))}
                          style={{ width:26,height:26,borderRadius:6,border:"1px solid #D4A96A",background:"#fff8f0",cursor:"pointer",fontSize:14 }}>+</button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(emb)}
                        style={{ padding:"7px 12px", borderRadius:8, background:c.bg, color:c.text, cursor:"pointer", fontSize:11, fontWeight:700, border:`1.5px solid ${c.border}` }}>
                        + Ajouter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panier latéral sticky */}
      <div className="commande-cart">
        <CartPanelEmballages cart={cart} setCart={setCart} boulangerieId={boulangerieId} onCommander={onCommander} />
      </div>
    </div>
    </>
  );
}

function TabHistorique({ history, onUpdateStatus, onUpdateCommande, isAdmin }) {
  const [filterB, setFilterB] = useState("Tous");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [cmdDetail, setCmdDetail] = useState(null);
  const [cmdModif, setCmdModif] = useState(null);

  const filtered = history.filter(c => {
    return (filterB === "Tous" || c.boulangerie === filterB) &&
           (filterStatus === "Tous" || c.status === filterStatus) &&
           (filterType === "Tous" || c.type === filterType);
  });

  const statusColor = { "Livré": "#217346", "En cours": "#E67E22", "Annulé": "#C0392B" };
  const bNames = ["Tous", ...BOULANGERIES.map(b => b.name)];

  return (
    <div>
      {cmdDetail && (
        <DetailCommande
          cmd={cmdDetail}
          onClose={() => setCmdDetail(null)}
          onUpdateStatus={async (id, status) => {
            await onUpdateStatus(id, status);
            setCmdDetail(null);
          }}
          onUpdateCommande={async (cmdModifiee) => {
            await onUpdateCommande(cmdModifiee);
          }}
        />
      )}
      {cmdModif && (
        <ModifierCommande
          cmd={cmdModif}
          onClose={() => setCmdModif(null)}
          onSave={async (cmdModifiee) => {
            await onUpdateCommande(cmdModifiee);
            setCmdModif(null);
          }}
        />
      )}

      {/* Filtre */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <select value={filterB} onChange={e => setFilterB(e.target.value)}
          style={{ padding:"8px 12px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", color:"#2C1810", fontSize:12, cursor:"pointer", outline:"none", flex:1, minWidth:140 }}>
          {bNames.map(n => <option key={n}>{n}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding:"8px 12px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", color:"#2C1810", fontSize:12, cursor:"pointer", outline:"none", flex:1, minWidth:120 }}>
          {["Tous","Livré","En cours","Annulé"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ padding:"8px 12px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", color:"#2C1810", fontSize:12, cursor:"pointer", outline:"none", flex:1, minWidth:140 }}>
          {["Tous","Matières premières","Emballages"].map(t => <option key={t}>{t}</option>)}
        </select>
        <span style={{ fontSize:11, color:"#9B7B5A", whiteSpace:"nowrap" }}>{filtered.length} commande(s)</span>
      </div>

      {/* Cartes commandes */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:"center", padding:40, color:"#b89878" }}>Aucune commande.</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(cmd => (
            <div key={cmd.id} style={{
              background:"#fff", borderRadius:12, border:"1.5px solid #EDD5B3",
              boxShadow:"0 2px 10px rgba(139,69,19,.07)", overflow:"hidden"
            }}>
              {/* Bande colorée statut */}
              <div style={{ height:4, background: statusColor[cmd.status] }} />

              <div style={{ padding:"12px 14px" }}>
                {/* Ligne 1 : ref + type + statut */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#8B4513", fontFamily:"monospace" }}>{cmd.id}</span>
                    <span style={{ padding:"2px 8px", borderRadius:8, fontSize:10, fontWeight:700,
                      background: cmd.type === "Emballages" ? "#EEF4FF" : "#FFF8F0",
                      color: cmd.type === "Emballages" ? "#1A4A9B" : "#8B4513",
                      border: cmd.type === "Emballages" ? "1px solid #4A7FD4" : "1px solid #D4A96A"
                    }}>
                      {cmd.type === "Emballages" ? "📦 Emballages" : "🌾 Mat. premières"}
                    </span>
                  </div>
                  <span style={{ padding:"3px 10px", borderRadius:10, background:statusColor[cmd.status]+"22", color:statusColor[cmd.status], fontSize:11, fontWeight:700 }}>
                    {cmd.status}
                  </span>
                </div>

                {/* Ligne 2 : boulangerie + date */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#2C1810" }}>{cmd.boulangerie}</span>
                  <span style={{ fontSize:11, color:"#9B7B5A" }}>{fmtDate(cmd.date)}</span>
                </div>

                {/* Ligne 3 : articles + total */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:11, color:"#9B7B5A" }}>{cmd.items} article(s)</span>
                  <span style={{ fontSize:14, fontWeight:800, color:"#2C1810", fontFamily:"Georgia" }}>{fmt(cmd.total)}</span>
                </div>

                {/* Boutons actions */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <button onClick={() => setCmdDetail(cmd)}
                    style={{ flex:1, minWidth:70, padding:"7px 6px", borderRadius:7, border:"1.5px solid #D4A96A", background:"#fffaf5", color:"#8B4513", cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#8B4513"; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#fffaf5"; e.currentTarget.style.color="#8B4513"; }}
                  >👁 Voir</button>

                  <button onClick={() => setCmdModif(cmd)}
                    style={{ flex:1, minWidth:80, padding:"7px 6px", borderRadius:7, border:"1.5px solid #A0B0D0", background:"#f0f4ff", color:"#3A5A9B", cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background="#3A5A9B"; e.currentTarget.style.color="#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background="#f0f4ff"; e.currentTarget.style.color="#3A5A9B"; }}
                  >✏️ Modifier</button>

                  {cmd.status !== "Annulé" && (
                    <button
                      onClick={() => { if (window.confirm(`Annuler la commande ${cmd.id} ?`)) { onUpdateStatus(cmd.id, "Annulé"); } }}
                      style={{ flex:1, minWidth:80, padding:"7px 6px", borderRadius:7, border:"1.5px solid #e74c3c", background:"#fff5f5", color:"#c0392b", cursor:"pointer", fontSize:11, fontWeight:700, transition:"all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background="#c0392b"; e.currentTarget.style.color="#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="#fff5f5"; e.currentTarget.style.color="#c0392b"; }}
                    >❌ Annuler</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAB DASHBOARD ───────────────────────────────────────────────────────────
function TabDashboard({ history }) {
  const totalCA = history.reduce((s, c) => s + c.total, 0);
  const enCours = history.filter(c => c.status === "En cours").length;
  const livrees = history.filter(c => c.status === "Livré").length;

  const byBoulangerie = BOULANGERIES.map(b => ({
    ...b,
    total: history.filter(c => c.boulangerie === b.name).reduce((s,c)=>s+c.total,0),
    count: history.filter(c => c.boulangerie === b.name).length,
  })).sort((a,b) => b.total - a.total);
  const maxTotal = Math.max(...byBoulangerie.map(b=>b.total), 1);

  const recent = [...history].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  const card = (icon, label, value, sub, bg, col) => (
    <div style={{ background:bg, borderRadius:12, padding:"16px 20px", flex:1, minWidth:120, boxShadow:"0 2px 10px rgba(0,0,0,.07)" }}>
      <div style={{ fontSize:24, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:20, fontWeight:800, color:col, fontFamily:"Georgia" }}>{value}</div>
      <div style={{ fontSize:11, fontWeight:700, color:col }}>{label}</div>
      {sub && <div style={{ fontSize:10, color:col+"99", marginTop:2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        {card("💰","Chiffre d'affaires",fmt(totalCA),"Total cumulé","linear-gradient(135deg,#FFF8F0,#FFE4C4)","#8B4513")}
        {card("📋","Commandes",history.length,"Total passées","linear-gradient(135deg,#F0F8FF,#D6EAF8)","#1A5276")}
        {card("🚚","En cours",enCours,"À livrer","linear-gradient(135deg,#FFFDE7,#FFF3CD)","#7D6608")}
        {card("✅","Livrées",livrees,"Finalisées","linear-gradient(135deg,#F0FFF4,#D4EFDF)","#1E8449")}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:"#fffaf5", borderRadius:12, padding:18, border:"1.5px solid #EDD5B3" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <h3 style={{ margin:0, fontFamily:"Georgia", color:"#2C1810", fontSize:13 }}>🏪 Volume par boulangerie</h3>
            <MercurialeLink />
          </div>
          {byBoulangerie.map(b => (
            <div key={b.id} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                <span style={{ fontWeight:700, color:"#2C1810" }}>{b.name}</span>
                <span style={{ color:"#8B4513", fontWeight:600 }}>{fmt(b.total)} ({b.count})</span>
              </div>
              <div style={{ height:8, background:"#EDD5B3", borderRadius:4 }}>
                <div style={{ height:"100%", borderRadius:4, width:`${(b.total/maxTotal)*100}%`, background:`linear-gradient(90deg,${b.color},${b.color}88)`, transition:"width .5s" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"#fffaf5", borderRadius:12, padding:18, border:"1.5px solid #EDD5B3" }}>
          <h3 style={{ margin:"0 0 14px", fontFamily:"Georgia", color:"#2C1810", fontSize:13 }}>⏱ Commandes récentes</h3>
          {recent.map((cmd, i) => (
            <div key={cmd.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i<recent.length-1 ? "1px solid #EDD5B3":"none" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:11, color:"#8B4513", fontFamily:"monospace" }}>{cmd.id}</div>
                <div style={{ fontSize:11, color:"#5A3A1A", fontWeight:600 }}>{cmd.boulangerie}</div>
                <div style={{ fontSize:10, color:"#b89878" }}>{fmtDate(cmd.date)}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontWeight:700, fontSize:13, color:"#2C1810" }}>{fmt(cmd.total)}</div>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10,
                  background: cmd.status==="Livré" ? "#f0fff4":"#fffde7",
                  color: cmd.status==="Livré" ? "#217346":"#7D6608", fontWeight:600 }}>
                  {cmd.status}
                </span>
              </div>
            </div>
          ))}
          {recent.length === 0 && <p style={{ color:"#b89878", fontSize:12 }}>Aucune commande.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── COMPTES ─────────────────────────────────────────────────────────────────
// ─── TAB PATISSERIE ──────────────────────────────────────────────────────────

function TabPatisserie({ boulangerieId, compte, isAdmin }) {
  const boulangerieNom = BOULANGERIES.find(b => b.id === boulangerieId)?.name || "";
  const isProducteur = boulangerieId === 4 || boulangerieId === 5; // La Ferrière (4) ou La Pause (5)
  const canManageCatalogue = isAdmin || isProducteur;
  const producteurNom = boulangerieId === 4 ? "La Ferrière" : boulangerieId === 5 ? "La Pause" : null;

  const [tabPat, setTabPat] = useState("catalogue");
  const [catalogue, setCatalogue] = useState([]);
  const [panier, setPanier] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [qtys, setQtys] = useState({});
  const [filterText, setFilterText] = useState("");
  const [filterProd, setFilterProd] = useState("");
  const [showModalArticle, setShowModalArticle] = useState(false);
  const [showModalExcep, setShowModalExcep] = useState(false);
  const [showModalModif, setShowModalModif] = useState(false);
  const [modifCmd, setModifCmd] = useState(null);
  const [modifItems, setModifItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingCat, setLoadingCat] = useState(true);

  // Brouillon panier
  const brouillonKey = `pat_brouillon_${boulangerieId}`;
  const saveBrouillon = async (newPanier) => {
    try {
      await postToSheets(PAT_URL, { action: "savePatBrouillon", boulangerieId, cart: newPanier });
    } catch(e) {}
  };

  const setPanierWithSave = (updater) => {
    setPanier(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (boulangerieId) saveBrouillon(next);
      return next;
    });
  };

  const chargerCatalogue = async () => {
    setLoadingCat(true);
    try {
      const res = await fetch(PAT_URL + "?action=getCataloguePat");
      const data = JSON.parse(await res.text());
      if (data.success && data.catalogue) setCatalogue(data.catalogue);
    } catch(e) { console.error(e); }
    setLoadingCat(false);
  };

  const chargerHistoriquePatisserie = async () => {
    try {
      const res = await fetch(PAT_URL + `?action=getHistoriquePat&boulangerieId=${boulangerieId}&isProducteur=${isProducteur}&producteurNom=${encodeURIComponent(producteurNom||"")}`);
      const data = JSON.parse(await res.text());
      if (data.success) setHistorique(data.commandes || []);
    } catch(e) {}
  };

  const chargerBrouillonPat = async () => {
    if (!boulangerieId) return;
    try {
      const res = await fetch(PAT_URL + `?action=getPatBrouillon&boulangerieId=${boulangerieId}`);
      const data = JSON.parse(await res.text());
      if (data.success && data.cart && data.cart.length > 0) setPanier(data.cart);
    } catch(e) {}
  };

  // Chargement catalogue + historique + brouillon
  useEffect(() => {
    chargerCatalogue();
    chargerHistoriquePatisserie();
    chargerBrouillonPat();
  }, [boulangerieId]);

  const isModifiable = (cmd) => {
    if (isProducteur) return false;
    const now = new Date();
    const livraison = new Date(cmd.dateLivraisonISO);
    const maxDelai = Math.max(...cmd.items.map(i => i.delai || 1));
    const limite = new Date(livraison);
    limite.setDate(limite.getDate() - maxDelai);
    return now <= limite;
  };

  const getDelaiRestant = (cmd) => {
    const now = new Date();
    const livraison = new Date(cmd.dateLivraisonISO);
    const maxDelai = Math.max(...cmd.items.map(i => i.delai || 1));
    const limite = new Date(livraison);
    limite.setDate(limite.getDate() - maxDelai);
    return Math.ceil((limite - now) / 86400000);
  };

  const itemsVisible = catalogue.filter(p => {
    if (!p.visible) return true; // si pas de visibilité définie, visible par tous
    const raw = Array.isArray(p.visible) ? p.visible : JSON.parse(p.visible || "[]");
    // Normalise tout en string pour comparaison fiable
    const visibleList = raw.map(v => String(v));
    return visibleList.includes(String(boulangerieId)) || visibleList.includes(boulangerieNom);
  });

  const filtered = itemsVisible.filter(p =>
    (!filterText || p.nom.toLowerCase().includes(filterText.toLowerCase())) &&
    (!filterProd || p.prod === filterProd)
  );

  const panierCount = panier.length;
  const notifCount = historique.filter(cmd =>
    cmd.items?.some(i => i.prod === producteurNom) &&
    (producteurNom === "La Pause" ? cmd.statusPause : cmd.statusFerriere) === "En attente"
  ).length;

  // ── RENDU TUILE PRODUIT ──
  const renderTuile = (p) => {
    const key = p.id;
    const inCart = panier.find(x => x.id === key);
    const qty = qtys[key] || 1;
    const minDate = new Date(); minDate.setDate(minDate.getDate() + (p.delai || 1));
    return (
      <div key={key} style={{
        background:"#fff", border: inCart ? "1.5px solid #8B4513" : "1.5px solid #EDD5B3",
        borderRadius:11, padding:12, display:"flex", flexDirection:"column", gap:7,
        boxShadow:"0 1px 6px rgba(139,69,19,.06)", transition:"all .15s"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:6 }}>
          <span style={{ fontWeight:700, fontSize:12, color:"#2C1810", lineHeight:1.3 }}>{p.nom}</span>
          <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background: p.prod==="La Pause"?"#E6F1FB":"#EAF3DE", color: p.prod==="La Pause"?"#0C447C":"#27500A", whiteSpace:"nowrap", flexShrink:0 }}>{p.prod}</span>
        </div>
        {p.desc && <div style={{ fontSize:10, color:"#9B7B5A", lineHeight:1.4 }}>{String(p.desc).substring(0,80)}{p.desc?.length>80?"...":""}</div>}
        {p.allerg && (Array.isArray(p.allerg)?p.allerg:JSON.parse(p.allerg||"[]")).length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
            {(Array.isArray(p.allerg)?p.allerg:JSON.parse(p.allerg||"[]")).map(a => (
              <span key={a} style={{ fontSize:9, padding:"1px 6px", background:"#FFF8E1", color:"#B8860B", borderRadius:20 }}>{a}</span>
            ))}
          </div>
        )}
        <div style={{ fontSize:10, color:"#9B7B5A" }}>Délai : J+{p.delai} — dispo dès le {minDate.toLocaleDateString("fr-FR")}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:2, gap:6 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#8B4513" }}>{Number(p.pvente).toFixed(2)} € TTC</div>
            <div style={{ fontSize:10, color:"#9B7B5A" }}>Achat : {Number(p.pachat).toFixed(2)} € HT / {p.unit}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
            {inCart ? (
              <button onClick={() => setPanierWithSave(prev => prev.filter(x => x.id !== key))}
                style={{ padding:"5px 10px", borderRadius:7, background:"#8B4513", color:"#fff", border:"none", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                ✓ ×{inCart.qty} — Retirer
              </button>
            ) : (
              <>
                <button onClick={() => setQtys(q => ({...q, [key]: Math.max(1,(q[key]||1)-1)}))}
                  style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A", background:"#fff", cursor:"pointer", fontSize:14 }}>−</button>
                <input type="number" value={qty} min="1" max="999"
                  onChange={e => setQtys(q => ({...q, [key]: Math.max(1, parseInt(e.target.value)||1)}))}
                  style={{ width:46, textAlign:"center", padding:"4px 4px", border:"1px solid #D4A96A", borderRadius:6, fontSize:13, fontWeight:600, color:"#2C1810", background:"#fffaf5" }}/>
                <button onClick={() => setQtys(q => ({...q, [key]: (q[key]||1)+1}))}
                  style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A", background:"#fff", cursor:"pointer", fontSize:14 }}>+</button>
                <button onClick={() => { setPanierWithSave(prev => [...prev, {...p, id:key, qty}]); }}
                  style={{ padding:"5px 10px", borderRadius:7, background:"linear-gradient(135deg,#C4874A,#8B4513)", color:"#fff", border:"none", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                  + Ajouter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };


  function getMinDatePat() {
    // Date minimum = aujourd'hui + délai max parmi les articles du panier
    const maxDelai = panier.filter(p=>!p.excep).reduce((max, p) => Math.max(max, p.delai || 1), 1);
    const min = new Date();
    min.setDate(min.getDate() + maxDelai);
    return min;
  }

  async function validerCommandePat() {
    if (!panier.length) return;
    const dateInput = document.getElementById("pat-date-livraison");
    const d = dateInput?.value;
    if (!d) { alert("Veuillez saisir une date de livraison."); return; }
    // Vérification du délai minimum
    const minDate = getMinDatePat();
    const dateLiv = new Date(d);
    if (dateLiv < minDate) {
      const maxDelai = panier.filter(p=>!p.excep).reduce((max, p) => Math.max(max, p.delai || 1), 1);
      // Trouver l'article avec le délai le plus long
      const articleDelai = panier.filter(p=>!p.excep).find(p => (p.delai||1) === maxDelai);
      alert(`La date de livraison est trop proche. L'article "${articleDelai?.nom}" nécessite un délai minimum de J+${maxDelai}. Date minimum : ${minDate.toLocaleDateString("fr-FR")}`);
      return;
    }
    setSaving(true);
    const cmd = {
      id: "PAT-" + Date.now(),
      date: new Date().toLocaleDateString("fr-FR"),
      dateLivraison: new Date(d).toLocaleDateString("fr-FR"),
      dateLivraisonISO: d,
      boulangerie: boulangerieNom,
      boulangerieId,
      items: panier,
      total: panier.filter(p=>!p.excep).reduce((s,p)=>s+Number(p.pachat)*p.qty,0),
      statusPause: panier.some(p=>p.prod==="La Pause") ? "En attente" : null,
      statusFerriere: panier.some(p=>p.prod==="La Ferrière") ? "En attente" : null,
    };
    try {
      await postToSheets(PAT_URL, { action: "saveCommandePat", commande: cmd });
      saveBrouillon([]);
      setPanier([]);
      setQtys({});
      await chargerHistoriquePatisserie();
      setTabPat("historique");
    } catch(e) { alert("Erreur lors de l'envoi."); }
    setSaving(false);
  }

  async function marquerLivrePatisserie(cmdId, prod) {
    setHistorique(prev => prev.map(c => {
      if (c.id !== cmdId) return c;
      const updated = {...c};
      if (prod==="La Pause") updated.statusPause="Livré";
      if (prod==="La Ferrière") updated.statusFerriere="Livré";
      return updated;
    }));
    await postToSheets(PAT_URL, { action: "updateStatusPat", id: cmdId, prod, status: "Livré" });
  }

  function genererBLPat(cmd, prod) {
    const items = cmd.items?.filter(i=>i.prod===prod) || [];
    const total = items.filter(i=>!i.excep).reduce((s,i)=>s+Number(i.pachat)*i.qty,0);
    const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
    const W=210, m=18;
    doc.setFillColor(139,69,19); doc.rect(0,0,W,28,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont("helvetica","bold");
    doc.text("BON DE LIVRAISON — "+prod, m, 12);
    doc.setFontSize(9); doc.setFont("helvetica","normal");
    doc.text("BoulangCommande — Pense Au Pain", m, 20);
    doc.setTextColor(44,24,16); doc.setFontSize(10);
    let y=38;
    doc.setFont("helvetica","bold"); doc.text("Commande :", m, y); doc.setFont("helvetica","normal"); doc.text(cmd.id, m+30, y); y+=6;
    doc.setFont("helvetica","bold"); doc.text("Boulangerie :", m, y); doc.setFont("helvetica","normal"); doc.text(cmd.boulangerie, m+30, y); y+=6;
    doc.setFont("helvetica","bold"); doc.text("Livraison :", m, y); doc.setFont("helvetica","normal"); doc.text(cmd.dateLivraison, m+30, y); y+=10;
    doc.setFillColor(212,169,106); doc.rect(m,y,W-2*m,7,"F");
    doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(9);
    doc.text("Article", m+2, y+5); doc.text("Qté", m+100, y+5); doc.text("Prix", m+130, y+5); y+=9;
    doc.setTextColor(44,24,16); doc.setFont("helvetica","normal");
    items.forEach(it => {
      doc.text(String(it.nom).substring(0,45), m+2, y);
      doc.text(String(it.qty), m+100, y);
      doc.text(it.excep?"Sur devis":Number(it.pachat*it.qty).toFixed(2)+" €", m+130, y);
      y+=6;
    });
    y+=4; doc.setDrawColor(212,169,106); doc.line(m,y,W-m,y); y+=6;
    doc.setFont("helvetica","bold"); doc.text("TOTAL : "+total.toFixed(2)+" €"+(items.some(i=>i.excep)?" + devis":""), m, y);
    doc.save("BL_"+prod.replace(/ /g,"_")+"_"+cmd.id+".pdf");
  }


  return (
    <div style={{ padding:0 }}>
      {/* Sous-onglets */}
      <div style={{ display:"flex", borderBottom:"1px solid #EDD5B3", background:"#fff" }}>
        {[
          { id:"catalogue", label:"Catalogue" },
          { id:"panier",    label:`Panier${panierCount>0?` (${panierCount})`:""}` },
          { id:"historique",label:`Historique${isProducteur&&notifCount>0?` 🔴`:""}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTabPat(t.id)}
            style={{ padding:"10px 18px", border:"none", background:"none", cursor:"pointer", fontSize:12, fontWeight:700,
              borderBottom: tabPat===t.id ? "3px solid #8B4513" : "3px solid transparent",
              color: tabPat===t.id ? "#8B4513" : "#9B7B5A", fontFamily:"Georgia, serif" }}>
            {t.label}
          </button>
        ))}
        {canManageCatalogue && (
          <button onClick={() => setShowModalArticle(true)}
            style={{ marginLeft:"auto", margin:"6px 12px", padding:"5px 12px", borderRadius:8, border:"1.5px solid #8B4513",
              background:"#8B4513", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"Georgia, serif" }}>
            + Nouvel article
          </button>
        )}
      </div>

      {/* CATALOGUE */}
      {tabPat==="catalogue" && (
        <div style={{ padding:14 }}>
          <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap", alignItems:"center" }}>
            <div style={{ position:"relative", flex:1, minWidth:160 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, pointerEvents:"none" }}>🔍</span>
              <input value={filterText} onChange={e=>setFilterText(e.target.value)}
                placeholder="Rechercher..."
                style={{ width:"100%", padding:"7px 10px 7px 30px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:12, boxSizing:"border-box" }}/>
            </div>
            <select value={filterProd} onChange={e=>setFilterProd(e.target.value)}
              style={{ padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:12, color:"#2C1810" }}>
              <option value="">Tous les producteurs</option>
              <option value="La Pause">La Pause</option>
              <option value="La Ferrière">La Ferrière</option>
            </select>
          </div>
          {loadingCat ? (
            <div style={{ textAlign:"center", padding:40, color:"#9B7B5A" }}>Chargement du catalogue…</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
              {filtered.map(renderTuile)}
              {/* Tuile commande exceptionnelle */}
              {!isProducteur && (
                <div style={{ border:"1.5px dashed #D4A96A", borderRadius:11, padding:12, background:"#fffaf5", display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span style={{ fontWeight:700, fontSize:12, color:"#8B4513" }}>Commande exceptionnelle</span>
                    <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"#FAEEDA", color:"#633806" }}>Hors catalogue</span>
                  </div>
                  <div style={{ fontSize:11, color:"#9B7B5A", lineHeight:1.5 }}>Article personnalisé — gâteau sur mesure, décor spécial…</div>
                  <div style={{ fontSize:10, color:"#9B7B5A" }}>Tarif communiqué ultérieurement par le producteur</div>
                  <button onClick={() => setShowModalExcep(true)}
                    style={{ padding:"6px 12px", borderRadius:7, border:"1.5px solid #D4A96A", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                    + Ajouter une demande exceptionnelle
                  </button>
                </div>
              )}
              {filtered.length === 0 && !loadingCat && (
                <div style={{ color:"#9B7B5A", fontSize:13, padding:20, gridColumn:"1/-1" }}>Aucun article disponible.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PANIER */}
      {tabPat==="panier" && (
        <div style={{ padding:14 }}>
          <div style={{ background:"#fff", border:"1px solid #EDD5B3", borderRadius:11, padding:14 }}>
            <div style={{ fontWeight:700, fontSize:13, color:"#2C1810", marginBottom:12 }}>Commande de pâtisserie</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:"#9B7B5A", marginBottom:4 }}>Boulangerie</div>
                <div style={{ padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:12, color:"#2C1810", fontWeight:600 }}>
                  {boulangerieNom}
                </div>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#9B7B5A", marginBottom:4 }}>Date de livraison souhaitée</div>
                <input type="date" id="pat-date-livraison"
                  min={(() => { const maxDelai = panier.filter(p=>!p.excep).reduce((max,p)=>Math.max(max,p.delai||1),1); const d=new Date(); d.setDate(d.getDate()+maxDelai); return d.toISOString().split("T")[0]; })()}
                  style={{ padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:12, color:"#2C1810", width:"100%" }}/>
              </div>
            </div>
            {panier.length === 0 ? (
              <div style={{ textAlign:"center", padding:20, color:"#9B7B5A", fontSize:12 }}>Aucun article — ajoutez-en depuis le catalogue.</div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
                {panier.map((p, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:8, background:"#FAF6F0", borderRadius:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#2C1810" }}>{p.nom}
                        <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, marginLeft:6,
                          background: p.excep?"#FAEEDA":p.prod==="La Pause"?"#E6F1FB":"#EAF3DE",
                          color: p.excep?"#633806":p.prod==="La Pause"?"#0C447C":"#27500A" }}>
                          {p.excep?"Exceptionnel":p.prod}
                        </span>
                      </div>
                      {p.excep ? (
                        <div style={{ fontSize:10, color:"#9B7B5A", fontStyle:"italic" }}>{p.desc}</div>
                      ) : (
                        <div style={{ fontSize:10, color:"#9B7B5A" }}>{Number(p.pachat).toFixed(2)} € HT / {p.unit}</div>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                      <span style={{ fontSize:12, color:"#9B7B5A" }}>×</span>
                      <input type="number" value={p.qty} min="1"
                        onChange={e => setPanierWithSave(prev => prev.map((x,j) => j===i ? {...x, qty:Math.max(1,parseInt(e.target.value)||1)} : x))}
                        style={{ width:50, textAlign:"center", padding:"4px 5px", border:"1px solid #D4A96A", borderRadius:6, fontSize:13 }}/>
                      {!p.excep && <span style={{ fontSize:12, fontWeight:700, color:"#8B4513", minWidth:52, textAlign:"right" }}>{(Number(p.pachat)*p.qty).toFixed(2)} €</span>}
                      {p.excep && <span style={{ fontSize:11, color:"#9B7B5A", minWidth:52, textAlign:"right" }}>Sur devis</span>}
                      <button onClick={() => setPanierWithSave(prev => prev.filter((_,j)=>j!==i))}
                        style={{ background:"none", border:"none", cursor:"pointer", color:"#c0392b", fontSize:14, padding:"2px 4px" }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ borderTop:"1px solid #EDD5B3", paddingTop:10, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#2C1810" }}>
                Total : <span style={{ color:"#8B4513" }}>
                  {panier.filter(p=>!p.excep).reduce((s,p)=>s+Number(p.pachat)*p.qty,0).toFixed(2)} €
                  {panier.some(p=>p.excep) ? " + articles sur devis" : ""}
                </span>
              </div>
              <button onClick={validerCommandePat} disabled={saving || panier.length===0}
                style={{ padding:"8px 18px", borderRadius:8, border:"none", background:"#8B4513", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700, opacity: panier.length===0?0.5:1 }}>
                {saving ? "Envoi…" : "Valider la commande"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORIQUE */}
      {tabPat==="historique" && (
        <div style={{ padding:14 }}>
          {historique.length === 0 ? (
            <div style={{ textAlign:"center", padding:40, color:"#9B7B5A" }}>Aucune commande.</div>
          ) : historique.map(cmd => {
            const pauseItems = cmd.items?.filter(i=>i.prod==="La Pause") || [];
            const ferrItems  = cmd.items?.filter(i=>i.prod==="La Ferrière") || [];
            const displayItems = isProducteur ? cmd.items?.filter(i=>i.prod===producteurNom) : cmd.items;
            const canEdit = isModifiable(cmd);
            const delaiR = getDelaiRestant(cmd);
            const myStatus = producteurNom==="La Pause" ? cmd.statusPause : cmd.statusFerriere;
            const s = [];
            if (cmd.statusPause) s.push(cmd.statusPause);
            if (cmd.statusFerriere) s.push(cmd.statusFerriere);
            const statutGlobal = s.every(x=>x==="Livré")?"Livré":s.some(x=>x==="Livré")?"Partiellement livré":"En attente";
            const statutColor = { "En attente":["#FFF8E1","#B8860B"], "Partiellement livré":["#E6F1FB","#0C447C"], "Livré":["#EAF3DE","#27500A"] };

            return (
              <div key={cmd.id} style={{ background:"#fff", border:"1px solid #EDD5B3", borderRadius:11, padding:14, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:6 }}>
                  <div>
                    <span style={{ fontSize:13, fontWeight:700, color:"#2C1810" }}>{cmd.id}</span>
                    <span style={{ fontSize:11, color:"#9B7B5A", marginLeft:8 }}>
                      {isProducteur ? cmd.boulangerie : ""} • Livraison le {cmd.dateLivraison}
                    </span>
                    {!isProducteur && canEdit && (
                      <span style={{ fontSize:10, color:"#8B4513", marginLeft:6 }}>Modifiable encore {delaiR}j</span>
                    )}
                    {!isProducteur && !canEdit && statutGlobal!=="Livré" && (
                      <span style={{ fontSize:10, color:"#9B7B5A", marginLeft:6 }}>Délai dépassé</span>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    {isProducteur ? (
                      <>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:statutColor[myStatus||"En attente"][0], color:statutColor[myStatus||"En attente"][1] }}>{myStatus}</span>
                        {myStatus==="En attente" && (
                          <button onClick={() => marquerLivrePatisserie(cmd.id, producteurNom)}
                            style={{ padding:"4px 10px", borderRadius:7, border:"none", background:"#8B4513", color:"#fff", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                            Marquer comme livré
                          </button>
                        )}
                        <button onClick={() => genererBLPat(cmd, producteurNom)}
                          style={{ padding:"4px 10px", borderRadius:7, border:`1px solid ${producteurNom==="La Pause"?"#B5D4F4":"#C0DD97"}`, background: producteurNom==="La Pause"?"#E6F1FB":"#EAF3DE", color: producteurNom==="La Pause"?"#0C447C":"#27500A", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                          Éditer BL
                        </button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:20, background:statutColor[statutGlobal][0], color:statutColor[statutGlobal][1] }}>{statutGlobal}</span>
                        {pauseItems.length>0 && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"#E6F1FB", color:"#0C447C" }}>La Pause : {cmd.statusPause}</span>}
                        {ferrItems.length>0  && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:20, background:"#EAF3DE", color:"#27500A" }}>La Ferrière : {cmd.statusFerriere}</span>}
                        {canEdit && (
                          <button onClick={() => { setModifCmd(cmd); setModifItems(cmd.items.map(i=>({...i}))); setShowModalModif(true); }}
                            style={{ padding:"4px 10px", borderRadius:7, border:"1.5px solid #8B4513", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:11, fontWeight:700 }}>
                            Modifier
                          </button>
                        )}
                        {pauseItems.length>0 && <button onClick={() => genererBLPat(cmd,"La Pause")} style={{ padding:"4px 10px", borderRadius:7, border:"1px solid #B5D4F4", background:"#E6F1FB", color:"#0C447C", cursor:"pointer", fontSize:11, fontWeight:700 }}>BL La Pause</button>}
                        {ferrItems.length>0  && <button onClick={() => genererBLPat(cmd,"La Ferrière")} style={{ padding:"4px 10px", borderRadius:7, border:"1px solid #C0DD97", background:"#EAF3DE", color:"#27500A", cursor:"pointer", fontSize:11, fontWeight:700 }}>BL La Ferrière</button>}
                      </>
                    )}
                  </div>
                </div>
                <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                  {(displayItems||[]).map((it,i) => (
                    <tr key={i}>
                      <td style={{ padding:"3px 0", color:"#2C1810" }}>{it.nom}{it.excep&&<span style={{ fontSize:9, padding:"1px 5px", borderRadius:20, background:"#FAEEDA", color:"#633806", marginLeft:5 }}>Excep.</span>}</td>
                      <td style={{ padding:"3px 6px" }}><span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, background:it.excep?"#FAEEDA":it.prod==="La Pause"?"#E6F1FB":"#EAF3DE", color:it.excep?"#633806":it.prod==="La Pause"?"#0C447C":"#27500A" }}>{it.excep?"Hors cat.":it.prod}</span></td>
                      <td style={{ textAlign:"right", color:"#9B7B5A" }}>×{it.qty}</td>
                      <td style={{ textAlign:"right", fontWeight:700, color:"#2C1810" }}>{it.excep?"Sur devis":(Number(it.pachat)*it.qty).toFixed(2)+" €"}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" style={{ paddingTop:6, borderTop:"1px solid #EDD5B3", fontWeight:700, color:"#9B7B5A" }}>Total</td>
                    <td style={{ textAlign:"right", fontWeight:700, color:"#8B4513", borderTop:"1px solid #EDD5B3" }}>
                      {(displayItems||[]).filter(i=>!i.excep).reduce((s,i)=>s+Number(i.pachat)*i.qty,0).toFixed(2)} €
                      {(displayItems||[]).some(i=>i.excep)?" + devis":""}
                    </td>
                  </tr>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL NOUVEL ARTICLE */}
      {showModalArticle && <ModalArticlePat onClose={()=>setShowModalArticle(false)} onSave={async (art)=>{
        setSaving(true);
        try {
          await postToSheets(PAT_URL, { action: "saveArticlePat", article: art });
          await chargerCatalogue();
        } catch(e){}
        setSaving(false);
        setShowModalArticle(false);
      }} boulangerieId={boulangerieId} />}

      {/* MODAL COMMANDE EXCEPTIONNELLE */}
      {showModalExcep && <ModalExcepPat onClose={()=>setShowModalExcep(false)} onAdd={(item)=>{ setPanierWithSave(prev=>[...prev,item]); setShowModalExcep(false); }} />}

      {/* MODAL MODIFIER COMMANDE */}
      {showModalModif && modifCmd && (
        <ModalModifPat
          cmd={modifCmd}
          items={modifItems}
          setItems={setModifItems}
          getDelaiRestant={getDelaiRestant}
          onClose={()=>setShowModalModif(false)}
          onSave={async()=>{
            setSaving(true);
            const updated = {...modifCmd, items: modifItems.filter(i=>i.qty>0)};
            updated.total = updated.items.filter(i=>!i.excep).reduce((s,i)=>s+Number(i.pachat)*i.qty,0);
            try {
              await postToSheets(PAT_URL, { action: "updateCommandePat", commande: updated });
              await chargerHistoriquePatisserie();
            } catch(e){}
            setSaving(false);
            setShowModalModif(false);
          }}
        />
      )}
    </div>
  );
}

// Pour changer un mot de passe, modifiez simplement la valeur "pwd" du compte concerné
const COMPTES = [
  { pwd: "admin2025",   role: "admin",       boulangerieId: null, label: "Administrateur" },
  { pwd: "cholet1",     role: "boutique",    boulangerieId: 1,    label: "Cholet Boulange" },
  { pwd: "sacrecoeur1", role: "boutique",    boulangerieId: 2,    label: "Cholet Sacré Coeur" },
  { pwd: "jard1",       role: "boutique",    boulangerieId: 3,    label: "Jard" },
  { pwd: "ferriere1",   role: "boutique",    boulangerieId: 4,    label: "La Ferrière" },
  { pwd: "pause1",      role: "boutique",    boulangerieId: 5,    label: "La Pause Cholet" },
];

function LoginScreen({ onLogin }) {
  const [pwd, setPwd] = useState("");
  const [erreur, setErreur] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleSubmit = () => {
    const compte = COMPTES.find(c => c.pwd === pwd);
    if (compte) {
      onLogin(compte);
    } else {
      setErreur(true);
      setPwd("");
      setTimeout(() => setErreur(false), 2500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#FAF6F0",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Calibri', Georgia, serif"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "40px 44px",
        boxShadow: "0 8px 40px rgba(139,69,19,.13)", border: "2px solid #D4A96A",
        width: 360, maxWidth: "90vw", textAlign: "center"
      }}>
        <img src="Pense_au_pain_mise_en_page.png" alt="Pense Au Pain"
          style={{ height: 90, width: 90, objectFit: "contain", marginBottom: 16 }} />
        <h1 style={{ margin: "0 0 4px", color: "#2C1810", fontFamily: "Georgia", fontSize: 20, fontWeight: 800 }}>
          BoulangCommande
        </h1>
        <p style={{ margin: "0 0 28px", color: "#9B7B5A", fontSize: 11, letterSpacing: 2 }}>
          PENSE AU PAIN — ACCÈS SÉCURISÉ
        </p>

        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            type={visible ? "text" : "password"}
            value={pwd}
            onChange={e => { setPwd(e.target.value); setErreur(false); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Mot de passe"
            autoFocus
            style={{
              width: "100%", padding: "12px 44px 12px 16px",
              border: `2px solid ${erreur ? "#e74c3c" : "#D4A96A"}`,
              borderRadius: 10, background: erreur ? "#fff5f5" : "#fffaf5",
              fontSize: 14, color: "#2C1810", outline: "none",
              boxSizing: "border-box", fontFamily: "Calibri, sans-serif",
              transition: "border-color .2s, background .2s"
            }}
          />
          <button onClick={() => setVisible(v => !v)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9B7B5A" }}>
            {visible ? "🙈" : "👁"}
          </button>
        </div>

        {erreur && (
          <p style={{ margin: "0 0 12px", color: "#e74c3c", fontSize: 12, fontWeight: 600 }}>
            ⚠ Mot de passe incorrect
          </p>
        )}

        <button onClick={handleSubmit}
          style={{
            width: "100%", padding: "12px 0",
            background: "linear-gradient(135deg, #8B4513, #6B3210)",
            color: "#fff", border: "none", borderRadius: 10,
            fontWeight: 700, fontSize: 14, fontFamily: "Georgia, serif",
            cursor: "pointer", boxShadow: "0 4px 14px rgba(139,69,19,.35)", transition: "opacity .15s"
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Accéder →
        </button>

        <p style={{ margin: "20px 0 0", fontSize: 10, color: "#C4A882" }}>
          Accès réservé aux équipes Pense Au Pain
        </p>
      </div>
    </div>
  );
}

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbxx2jIIJon7gjoOD3HZNKJfPvCxy7BAIq3oqRZcW3F-kof8hO4F5baU9J00jnk23cvqxA/exec";
const PAT_URL    = SHEETS_URL; // réutilise le même Apps Script

// ─── Helpers POST ─────────────────────────────────────────────────────────────
const postToSheets = async (url, data) => {
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};


const EMB_URL    = "https://script.google.com/macros/s/AKfycbwIv4kiUS6P8yRYQC8_smlo92e4mZqdo641ytEzRWjeZFyb-PRdgUphHF88s9Cwlaa3/exec";

// ── Sous-composants modaux ───────────────────────────────────────────────────

function ModalArticlePat({ onClose, onSave, boulangerieId }) {
  const [form, setForm] = useState({ nom:"", prod:"La Pause", pvente:"", pachat:"", delai:"7", unit:"pièce", desc:"", allerg:[], visible: BOULANGERIES.map(b=>b.id) });
  const allergens = ["Gluten","Oeufs","Lait","Fruits à coque","Soja","Arachides"];
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div style={{ position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:30, zIndex:1000, overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDD5B3", width:580, maxWidth:"95%", padding:22, maxHeight:"85vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:15, fontWeight:700, color:"#2C1810", fontFamily:"Georgia" }}>Nouvel article pâtisserie</span>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #D4A96A", borderRadius:6, cursor:"pointer", padding:"3px 9px", color:"#8B4513" }}>✕</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Nom</label>
              <input value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Ex: Tarte aux fraises"
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, boxSizing:"border-box" }}/></div>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Producteur</label>
              <select value={form.prod} onChange={e=>set("prod",e.target.value)}
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13 }}>
                <option>La Pause</option><option>La Ferrière</option>
              </select></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Prix vente conseillé (€ TTC)</label>
              <input type="number" value={form.pvente} onChange={e=>set("pvente",e.target.value)} placeholder="0.00" step="0.01"
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, boxSizing:"border-box" }}/></div>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Prix d'achat boulangerie (€ HT)</label>
              <input type="number" value={form.pachat} onChange={e=>set("pachat",e.target.value)} placeholder="0.00" step="0.01"
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, boxSizing:"border-box" }}/></div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Délai minimum</label>
              <select value={form.delai} onChange={e=>set("delai",e.target.value)}
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13 }}>
                {["1","2","3","5","7","14"].map(d=><option key={d} value={d}>J+{d}</option>)}
              </select></div>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Unité / conditionnement</label>
              <input value={form.unit} onChange={e=>set("unit",e.target.value)} placeholder="pièce, kg, 6 pcs…"
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, boxSizing:"border-box" }}/></div>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:5 }}>Visible pour les boulangeries</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, padding:10, background:"#FAF6F0", borderRadius:8 }}>
              {BOULANGERIES.map(b => (
                <label key={b.id} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#2C1810", cursor:"pointer" }}>
                  <input type="checkbox" checked={form.visible.includes(b.id)}
                    onChange={e=>set("visible", e.target.checked ? [...form.visible,b.id] : form.visible.filter(x=>x!==b.id))}
                    style={{ cursor:"pointer" }}/> {b.name.replace("Pense Au Pain ","").replace("La Pause Cholet","La Pause Cholet")}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:5 }}>Allergènes</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {allergens.map(a=>(
                <span key={a} onClick={()=>set("allerg", form.allerg.includes(a)?form.allerg.filter(x=>x!==a):[...form.allerg,a])}
                  style={{ padding:"3px 10px", borderRadius:20, cursor:"pointer", fontSize:11, fontWeight:600,
                    background: form.allerg.includes(a)?"#FFF8E1":"#FAF6F0",
                    color: form.allerg.includes(a)?"#B8860B":"#9B7B5A",
                    border: form.allerg.includes(a)?"1px solid #D4A96A":"1px solid #EDD5B3" }}>{a}</span>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Composition & description</label>
            <textarea value={form.desc} onChange={e=>set("desc",e.target.value)}
              placeholder="Ex: Pâte sablée, crème pâtissière, framboises fraîches…"
              style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, minHeight:60, resize:"vertical", boxSizing:"border-box" }}/>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginTop:4 }}>
            <button onClick={onClose} style={{ padding:"6px 14px", borderRadius:7, border:"1px solid #D4A96A", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:12 }}>Annuler</button>
            <button onClick={()=>{ if(!form.nom.trim()){alert("Veuillez saisir un nom.");return;} onSave({...form, id:"pat-"+Date.now(), pvente:parseFloat(form.pvente)||0, pachat:parseFloat(form.pachat)||0, delai:parseInt(form.delai)||1}); }}
              style={{ padding:"6px 14px", borderRadius:7, border:"none", background:"#8B4513", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalExcepPat({ onClose, onAdd }) {
  const [nom, setNom] = useState("");
  const [prod, setProd] = useState("La Pause");
  const [qty, setQty] = useState(1);
  const [desc, setDesc] = useState("");
  return (
    <div style={{ position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDD5B3", width:440, maxWidth:"95%", padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:15, fontWeight:700, color:"#2C1810", fontFamily:"Georgia" }}>Commande exceptionnelle</span>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #D4A96A", borderRadius:6, cursor:"pointer", padding:"3px 9px", color:"#8B4513" }}>✕</button>
        </div>
        <div style={{ fontSize:11, color:"#9B7B5A", marginBottom:14 }}>Article hors catalogue — sans tarif</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Nom de l'article</label>
            <input value={nom} onChange={e=>setNom(e.target.value)} placeholder="Ex: Gâteau anniversaire personnalisé"
              style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, boxSizing:"border-box" }}/></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Producteur</label>
              <select value={prod} onChange={e=>setProd(e.target.value)}
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13 }}>
                <option>La Pause</option><option>La Ferrière</option>
              </select></div>
            <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Quantité</label>
              <input type="number" value={qty} min="1" onChange={e=>setQty(Math.max(1,parseInt(e.target.value)||1))}
                style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, boxSizing:"border-box" }}/></div>
          </div>
          <div><label style={{ fontSize:11, color:"#9B7B5A", display:"block", marginBottom:3 }}>Description / instructions</label>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)}
              placeholder="Ex: Gâteau 3 étages, décor floral, inscription 'Joyeux anniversaire'…"
              style={{ width:"100%", padding:"7px 10px", border:"2px solid #D4A96A", borderRadius:8, background:"#fffaf5", fontSize:13, minHeight:80, resize:"vertical", boxSizing:"border-box" }}/></div>
          <div style={{ padding:"8px 12px", background:"#FFF8E1", borderRadius:8, fontSize:11, color:"#B8860B" }}>
            Le tarif sera communiqué ultérieurement par le producteur.
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
            <button onClick={onClose} style={{ padding:"6px 14px", borderRadius:7, border:"1px solid #D4A96A", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:12 }}>Annuler</button>
            <button onClick={()=>{ if(!nom.trim()){alert("Veuillez saisir un nom.");return;} if(!desc.trim()){alert("Veuillez ajouter une description.");return;} onAdd({id:"excep-"+Date.now(),nom,prod,qty,desc,excep:true,delai:0,pachat:0,unit:"pièce"}); }}
              style={{ padding:"6px 14px", borderRadius:7, border:"none", background:"#8B4513", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>Ajouter au panier</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalModifPat({ cmd, items, setItems, getDelaiRestant, onClose, onSave }) {
  const delaiR = getDelaiRestant(cmd);
  return (
    <div style={{ position:"fixed", top:0,left:0,right:0,bottom:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:30, zIndex:1000, overflowY:"auto" }}>
      <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDD5B3", width:540, maxWidth:"95%", padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:15, fontWeight:700, color:"#2C1810", fontFamily:"Georgia" }}>Modifier {cmd.id}</span>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #D4A96A", borderRadius:6, cursor:"pointer", padding:"3px 9px", color:"#8B4513" }}>✕</button>
        </div>
        <div style={{ padding:"8px 12px", background:"#FAF6F0", borderRadius:8, fontSize:11, color:"#9B7B5A", marginBottom:12 }}>
          Livraison le <strong>{cmd.dateLivraison}</strong> — délai de modification restant : <strong style={{ color:"#8B4513" }}>{delaiR} jour(s)</strong>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
          {items.map((it,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:8, background:"#FAF6F0", borderRadius:8 }}>
              <div style={{ flex:1, fontSize:12, fontWeight:600, color:"#2C1810" }}>
                {it.nom}
                <span style={{ fontSize:10, padding:"2px 6px", borderRadius:20, marginLeft:5, background:it.excep?"#FAEEDA":it.prod==="La Pause"?"#E6F1FB":"#EAF3DE", color:it.excep?"#633806":it.prod==="La Pause"?"#0C447C":"#27500A" }}>{it.excep?"Excep.":it.prod}</span>
                {!it.excep && <div style={{ fontSize:10, color:"#9B7B5A" }}>Délai min J+{it.delai}</div>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <button onClick={()=>setItems(prev=>prev.map((x,j)=>j===i?{...x,qty:Math.max(0,x.qty-1)}:x))}
                  style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A", background:"#fff", cursor:"pointer", fontSize:14 }}>−</button>
                <input type="number" value={it.qty} min="0"
                  onChange={e=>setItems(prev=>prev.map((x,j)=>j===i?{...x,qty:Math.max(0,parseInt(e.target.value)||0)}:x))}
                  style={{ width:50, textAlign:"center", padding:"4px 5px", border:"1px solid #D4A96A", borderRadius:6, fontSize:13 }}/>
                <button onClick={()=>setItems(prev=>prev.map((x,j)=>j===i?{...x,qty:x.qty+1}:x))}
                  style={{ padding:"3px 8px", borderRadius:6, border:"1px solid #D4A96A", background:"#fff", cursor:"pointer", fontSize:14 }}>+</button>
                <button onClick={()=>setItems(prev=>prev.filter((_,j)=>j!==i))}
                  style={{ padding:"3px 9px", borderRadius:6, border:"1px solid #e24b4a", background:"#fff", color:"#e24b4a", cursor:"pointer", fontSize:11 }}>Supp.</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#9B7B5A", marginBottom:12 }}>Quantité à 0 ou suppression = article retiré de la commande.</div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, borderTop:"1px solid #EDD5B3", paddingTop:12 }}>
          <button onClick={onClose} style={{ padding:"6px 14px", borderRadius:7, border:"1px solid #D4A96A", background:"#fff", color:"#8B4513", cursor:"pointer", fontSize:12 }}>Annuler</button>
          <button onClick={onSave} style={{ padding:"6px 14px", borderRadius:7, border:"none", background:"#8B4513", color:"#fff", cursor:"pointer", fontSize:12, fontWeight:700 }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [compte, setCompte] = useState(null); // null = non connecté
  const [tab, setTab] = useState("commande");
  const [cart, setCart] = useState([]);
  const [boulangerieId, setBoulangerieId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);

  // ── Mercuriale ──
  const [produits, setProduits] = useState(ALL_PRODUCTS);

  const chargerMercuriale = async () => {
    try {
      const res = await fetch(SHEETS_URL + "?action=getMercuriale");
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success && data.produits && data.produits.length > 0) {
        setProduits(data.produits);
      }
    } catch(e) { console.error("Erreur chargement mercuriale", e); }
  };

  // ── Favoris ──
  const [favoris, setFavoris] = useState([]);

  const chargerFavoris = async (boulId) => {
    if (!boulId) return;
    try {
      const res = await fetch(SHEETS_URL + `?action=getFavoris&boulangerieId=${boulId}`);
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) setFavoris(data.favoris || []);
    } catch(e) { console.error("Erreur chargement favoris", e); }
  };

  const toggleFavori = async (key) => {
    const boulId = boulangerieId;
    if (!boulId) return;
    const nouveaux = favoris.includes(key)
      ? favoris.filter(f => f !== key)
      : [...favoris, key];
    setFavoris(nouveaux);
    try {
      await postToSheets(SHEETS_URL, { action: "saveFavoris", boulangerieId: boulId, favoris: nouveaux });
    } catch(e) { console.error("Erreur sauvegarde favoris", e); }
  };

  // ── Brouillon panier matières premières ──
  const [brouillon, setBrouillon] = useState(null);

  const sauvegarderBrouillon = async (newCart, boulId) => {
    if (!boulId) return;
    try {
      await postToSheets(SHEETS_URL, { action: "saveBrouillon", boulangerieId: boulId, cart: newCart });
    } catch(e) { console.error("Erreur sauvegarde brouillon", e); }
  };

  const chargerBrouillon = async (boulId) => {
    if (!boulId) return;
    try {
      const res = await fetch(SHEETS_URL + `?action=getBrouillon&boulangerieId=${boulId}`);
      const data = JSON.parse(await res.text());
      if (data.success && Array.isArray(data.cart) && data.cart.length > 0) {
        setBrouillon(data.cart);
      }
    } catch(e) { console.error("Erreur chargement brouillon", e); }
  };

  const setCartWithSave = (updater) => {
    setCart(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (boulangerieId) sauvegarderBrouillon(next, boulangerieId);
      return next;
    });
  };

  // ── Emballages ──
  const [emballages, setEmballages] = useState([]);
  const [cmdEmb, setCmdEmb] = useState([]);
  const [historyEmb, setHistoryEmb] = useState([]);

  const chargerEmballages = async () => {
    try {
      const res = await fetch(EMB_URL + "?action=getCatalogue");
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success) setEmballages(data.catalogue || []);
      const res2 = await fetch(EMB_URL + "?action=getCommandes");
      const text2 = await res2.text();
      const data2 = JSON.parse(text2);
      if (data2.success) {
        const cmdsEmb = (data2.commandes || []).filter(c => c.id).map(c => ({ ...c, type: "Emballages" })).reverse();
        setHistoryEmb(cmdsEmb);
        // Fusionner avec l'historique principal (les EMB qui n'y sont pas déjà)
        setHistory(prev => {
          const ids = new Set(prev.map(c => c.id));
          const nouvelles = cmdsEmb.filter(c => !ids.has(c.id));
          return [...nouvelles, ...prev].sort((a,b) => b.date.localeCompare(a.date));
        });
      }
    } catch(e) { console.error("Erreur chargement emballages", e); }
  };

  const ajouterEmballage = async (emb) => {
    setEmballages(prev => [...prev, emb]);
    try {
      const params = new URLSearchParams({ action:"addEmballage", ...emb });
      await fetch(EMB_URL + "?" + params.toString(), { method:"GET", mode:"no-cors" });
    } catch(e) { console.error(e); }
  };

  const modifierStockEmb = async (ref, newStock) => {
    setEmballages(prev => prev.map(e => e.ref === ref ? { ...e, stock: newStock } : e));
    try {
      const params = new URLSearchParams({ action:"updateStock", ref, stock: newStock });
      await fetch(EMB_URL + "?" + params.toString(), { method:"GET", mode:"no-cors" });
    } catch(e) { console.error(e); }
  };

  const passerCommandeEmb = async (cmd) => {
    // Décrémenter le stock localement
    const detail = typeof cmd.detail === "string" ? JSON.parse(cmd.detail) : cmd.detail;
    setEmballages(prev => prev.map(e => {
      const ligne = detail.find(i => i.ref === e.ref);
      if (!ligne) return e;
      const unites = ligne.qty * (parseInt(ligne.unit) || 1);
      return { ...e, stock: Math.max(0, (Number(e.stock) || 0) - unites) };
    }));
    // Ajouter à l'historique emballages ET à l'historique principal
    setHistoryEmb(prev => [cmd, ...prev]);
    setHistory(prev => [cmd, ...prev]);
    // Sync Google Sheets principal (même endpoint que les matières premières)
    setSyncing(true);
    setSyncError(false);
    try {
      await postToSheets(SHEETS_URL, {
        action: "saveCommande",
        id: cmd.id, date: cmd.date, boulangerie: cmd.boulangerie,
        type: "Emballages",
        items: cmd.items, total: cmd.total, status: cmd.status,
        detail: detail
      });
      setSyncing(false);
    } catch(e) { setSyncError(true); setSyncing(false); console.error(e); }
    // Sync Google Sheets emballages
    try {
      const params2 = new URLSearchParams({
        action: "addCommande",
        id: cmd.id, date: cmd.date, boulangerie: cmd.boulangerie,
        items: cmd.items, total: cmd.total, status: cmd.status,
        detail: JSON.stringify(detail)
      });
      await fetch(EMB_URL + "?" + params2.toString(), { method:"GET", mode:"no-cors" });
      // Mettre à jour les stocks dans le sheet
      for (const ligne of detail) {
        const emb = emballages.find(e => e.ref === ligne.ref);
        if (emb) {
          const unites = ligne.qty * (parseInt(ligne.unit) || 1);
          const newStock = Math.max(0, (Number(emb.stock) || 0) - unites);
          const sp = new URLSearchParams({ action:"updateStock", ref: ligne.ref, stock: newStock });
          await fetch(EMB_URL + "?" + sp.toString(), { method:"GET", mode:"no-cors" });
        }
      }
    } catch(e) { console.error(e); }
  };

  const isAdmin = compte?.role === "admin";

  // Charger les commandes depuis Google Sheets au login
  const chargerCommandes = async () => {
    setLoading(true);
    try {
      const res = await fetch(SHEETS_URL + "?action=get");
      const text = await res.text();
      const data = JSON.parse(text);
      if (data.success && data.commandes) {
        const all = data.commandes.filter(c => c.id).reverse();
        setHistory(all);
      }
    } catch(e) {
      console.error("Erreur chargement commandes", e);
    }
    setLoading(false);
  };

  const handleLogin = (compteChoisi) => {
    setCompte(compteChoisi);
    if (compteChoisi.boulangerieId) setBoulangerieId(compteChoisi.boulangerieId);
    chargerCommandes();
    chargerEmballages();
    chargerMercuriale();
    chargerFavoris(compteChoisi.boulangerieId);
    chargerBrouillon(compteChoisi.boulangerieId);
  };

  if (!compte) return <LoginScreen onLogin={handleLogin} />;

  // Historique filtré selon le rôle
  const historyVisible = isAdmin
    ? history
    : history.filter(c => c.boulangerie === BOULANGERIES.find(b => b.id === compte.boulangerieId)?.name);

  const addToHistory = async (cmd) => {
    // Effacer le brouillon quand la commande est validée
    sauvegarderBrouillon([], boulangerieId);
    setBrouillon(null);
    // Ajout immédiat en local
    setHistory(prev => [cmd, ...prev]);
    // Envoi vers Google Sheets via no-cors
    setSyncing(true);
    setSyncError(false);
    try {
      await postToSheets(SHEETS_URL, {
        action:      "saveCommande",
        id:          cmd.id,
        date:        cmd.date,
        boulangerie: cmd.boulangerie,
        type:        cmd.type,
        items:       cmd.items,
        total:       cmd.total,
        status:      cmd.status,
        detail:      cmd.detail || []
      });
      setSyncing(false);
    } catch(e) {
      setSyncError(true);
      setSyncing(false);
      console.error("Erreur sync Google Sheets", e);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setHistory(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    // Mettre à jour aussi dans historyEmb si c'est une commande emballages
    if (id.startsWith("EMB-")) {
      setHistoryEmb(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      try {
        const params = new URLSearchParams({ action: "updateStatus", id, status: newStatus });
        await fetch(EMB_URL + "?" + params.toString(), { method: "GET", mode: "no-cors" });
      } catch(e) { console.error("Erreur mise à jour statut EMB", e); }
    }
    try {
      await postToSheets(SHEETS_URL, { action: "updateStatus", id, status: newStatus });
    } catch(e) {
      console.error("Erreur mise à jour statut", e);
    }
  };

  const updateCommande = async (cmdModifiee) => {
    // Mise à jour locale immédiate
    setHistory(prev => prev.map(c => c.id === cmdModifiee.id ? cmdModifiee : c));
    // Mise à jour Google Sheets
    try {
      await postToSheets(SHEETS_URL, {
        action:      "updateCommande",
        id:          cmdModifiee.id,
        date:        cmdModifiee.date,
        boulangerie: cmdModifiee.boulangerie,
        type:        cmdModifiee.type,
        items:       cmdModifiee.items,
        total:       cmdModifiee.total,
        status:      cmdModifiee.status,
        detail:      cmdModifiee.detail || []
      });
    } catch(e) {
      console.error("Erreur mise à jour commande", e);
    }
  };

  const tabs = [
    { id: "dashboard",   label: "Tableau de bord",            icon: "📊" },
    { id: "commande",    label: "Commande matières premières", icon: "🌾" },
    { id: "emballages",  label: "Commande emballages",         icon: "📦" },
    { id: "patisserie",  label: "Commande pâtisserie",         icon: "🍰" },
    { id: "historique",  label: "Historique",                  icon: "📋" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#FAF6F0", fontFamily:"'Calibri', Georgia, serif" }}>
      <StyleTag />

      {/* Header */}
      <div className="pap-header" style={{ background:"#fff", borderBottom:"2px solid #D4A96A", boxShadow:"0 2px 10px rgba(139,69,19,.09)" }}>
        <img src="Pense_au_pain_mise_en_page.png" alt="Pense Au Pain" style={{ height:52, width:52, objectFit:"contain", flexShrink:0 }} />
        <div className="pap-header-title">
          <h1 style={{ margin:0, color:"#2C1810", fontFamily:"Georgia", fontSize:18, fontWeight:800, letterSpacing:1 }}>BoulangCommande</h1>
          <p style={{ margin:0, color:"#9B7B5A", fontSize:10, letterSpacing:2 }}>PENSE AU PAIN — GESTION DES APPROVISIONNEMENTS</p>
        </div>
        <div className="pap-header-controls">
          {/* Sélecteur boulangerie : verrouillé pour les boutiques */}
          {isAdmin ? (
            <select className="pap-header-select" value={boulangerieId ?? ""} onChange={e => setBoulangerieId(e.target.value ? Number(e.target.value) : null)}
              style={{
                border:"2px solid #D4A96A", borderRadius:9,
                background:"#fffaf5", color: boulangerieId ? "#2C1810" : "#b89878",
                fontWeight:700, fontFamily:"Georgia, serif", cursor:"pointer", outline:"none",
                appearance:"none",
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238B4513' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center"
              }}>
              <option value="">— Choisir une boulangerie —</option>
              {BOULANGERIES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          ) : (
            <div style={{ padding:"8px 14px", borderRadius:9, border:"2px solid #D4A96A", background:"#fffaf5", fontWeight:700, fontFamily:"Georgia, serif", fontSize:12, color:"#2C1810" }}>
              🏪 {BOULANGERIES.find(b => b.id === compte.boulangerieId)?.name}
            </div>
          )}

          {/* Badge rôle */}
          <div style={{ padding:"4px 10px", borderRadius:10, background: isAdmin ? "#2C1810" : "#EDD5B3", color: isAdmin ? "#D4A96A" : "#8B4513", fontSize:10, fontWeight:700, whiteSpace:"nowrap", flexShrink:0 }}>
            {isAdmin ? "👑 Admin" : "🏪 Boutique"}
          </div>

          {syncing && <span style={{ fontSize:11, color:"#E67E22", fontWeight:600, whiteSpace:"nowrap" }}>⏳ <span className="pap-header-btn-text">Sync…</span></span>}
          {syncError && <span style={{ fontSize:11, color:"#e74c3c", fontWeight:600 }}>⚠ <span className="pap-header-btn-text">Erreur</span></span>}
          {!syncing && !syncError && history.length > 0 && <span style={{ fontSize:11, color:"#27ae60", fontWeight:600 }}>✓ <span className="pap-header-btn-text">Synchronisé</span></span>}

          <button onClick={chargerCommandes} disabled={loading}
            style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #D4A96A", background:"#fff", color:"#9B7B5A", cursor:"pointer", fontSize:13, flexShrink:0 }}
            title="Rafraîchir les commandes"
          >{loading ? "⏳" : "🔄"}</button>

          <button onClick={() => { setCompte(null); setBoulangerieId(null); setHistory([]); setCart([]); }}
            style={{ padding:"7px 12px", borderRadius:9, border:"1.5px solid #D4A96A", background:"#fff", color:"#9B7B5A", cursor:"pointer", fontSize:11, fontWeight:600, whiteSpace:"nowrap", flexShrink:0 }}
            title="Se déconnecter"
          >🔒 <span className="pap-header-btn-text">Déconnexion</span></button>
        </div>
      </div>

      {/* Bannière brouillon matières premières */}
      {brouillon && Array.isArray(brouillon) && brouillon.length > 0 && cart.length === 0 && (
        <div style={{
          background:"#FFF8E1", borderBottom:"2px solid #F5A623",
          padding:"10px 20px", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12, flexWrap:"wrap"
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>🛒</span>
            <span style={{ fontSize:12, fontWeight:700, color:"#7D5A00" }}>
              Panier en cours ({brouillon.length} article{brouillon.length > 1 ? "s" : ""}) — reprendre votre commande ?
            </span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => { setCartWithSave(brouillon); setBrouillon(null); }}
              style={{ padding:"6px 14px", borderRadius:7, border:"none", background:"#F5A623", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"Georgia, serif" }}>
              ↩ Reprendre le panier
            </button>
            <button onClick={() => { sauvegarderBrouillon([], boulangerieId); setBrouillon(null); }}
              style={{ padding:"6px 14px", borderRadius:7, border:"1px solid #ccc", background:"#fff", color:"#999", fontWeight:600, fontSize:12, cursor:"pointer", fontFamily:"Georgia, serif" }}>
              ✕ Ignorer
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="pap-tabs" style={{ background:"#fff", display:"flex", borderBottom:"1px solid #E8D5B7" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              flex:1, background:"none", border:"none",
              borderBottom: tab===t.id ? "3px solid #8B4513" : "3px solid transparent",
              color: tab===t.id ? "#8B4513" : "#9B7B5A",
              cursor:"pointer", fontWeight:700, fontFamily:"Georgia, serif",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
              transition:"color .15s"
            }}>
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
            {t.id==="commande" && cart.length > 0 && (
              <span style={{ background:"#8B4513", color:"#fff", borderRadius:10, fontSize:10, padding:"1px 6px", fontWeight:800 }}>
                {cart.reduce((s,i)=>s+i.qty,0)}
              </span>
            )}
            {t.id==="historique" && historyVisible.length > 0 && (
              <span style={{ background:"#EDD5B3", color:"#8B4513", borderRadius:10, fontSize:10, padding:"1px 6px" }}>{historyVisible.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="pap-content">
        <div className="pap-card-inner" style={{ background:"#fff", borderRadius:14, boxShadow:"0 2px 14px rgba(139,69,19,.07)", border:"1px solid #EDD5B3", minHeight:400 }}>
          {tab==="dashboard"   && <TabDashboard history={historyVisible} />}
          {tab==="commande"    && <TabCommande cart={cart} setCart={setCartWithSave} boulangerieId={boulangerieId} addToHistory={addToHistory} produits={produits} setProduits={setProduits} favoris={favoris} toggleFavori={toggleFavori} history={history} />}
          {tab==="emballages"  && <TabEmballages emballages={emballages} boulangerieId={boulangerieId} isAdmin={isAdmin} onAjouter={ajouterEmballage} onModifierStock={modifierStockEmb} onCommander={passerCommandeEmb} />}
          {tab==="patisserie"  && <TabPatisserie boulangerieId={boulangerieId} compte={compte} isAdmin={isAdmin} />}
          {tab==="historique"  && <TabHistorique history={historyVisible} onUpdateStatus={updateStatus} onUpdateCommande={updateCommande} isAdmin={isAdmin} />}
        </div>
      </div>
    </div>
  );
}
