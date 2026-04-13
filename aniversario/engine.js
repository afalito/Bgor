/* Motor de premios — lógica interna */
(function (w) {
  const _d = {
    L1: [
      {
        id: "parches",
        w: 95,
        name: "Kit Parches Homeopáticos",
        img: "images/parches.webp",
        svg: false,
      },
      {
        id: "desc10",
        w: 5,
        name: "Descuento del 10%",
        img: null,
        svg: "desc10",
      },
    ],
    L2: [
      {
        id: "recipientes",
        w: 17,
        name: "Set Recipientes Nevera",
        img: "images/set-recipientes.webp",
        svg: false,
      },
      {
        id: "espuma",
        w: 25,
        name: "Espuma Blanqueadora Dental",
        img: "images/espuma-dental.webp",
        svg: false,
      },
      {
        id: "masajeador",
        w: 13,
        name: "Masajeador Mariposa",
        img: "images/masajeador.webp",
        svg: false,
      },
      { id: "bono20", w: 10, name: "Bono de $20.000", img: null, svg: "bono" },
      { id: "bono30", w: 15, name: "Bono de $30.000", img: null, svg: "bono" },
      {
        id: "fumigadora",
        w: 20,
        name: "Fumigadora Manual 2L",
        img: "images/fumigadora.webp",
        svg: false,
      },
    ],
    L3: [
      {
        id: "kzador",
        w: 30,
        name: "Kzador",
        img: "images/kzador.webp",
        svg: false,
      },
      {
        id: "fumigadora3",
        w: 30,
        name: "Fumigadora Manual 2L",
        img: "images/fumigadora.webp",
        svg: false,
      },
      {
        id: "kilobgor",
        w: 30,
        name: "Kilo BGOR a Elección",
        img: "images/kilo-bgor.webp",
        svg: false,
      },
      { id: "bono40", w: 10, name: "Bono de $40.000", img: null, svg: "bono" },
    ],
  };
  function _pick(list) {
    const total = list.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total,
      acc = 0;
    for (const item of list) {
      acc += item.w;
      if (r < acc) return item;
    }
    return list[list.length - 1];
  }
  w._bgorEngine = {
    roll: function () {
      return {
        L1: _pick(_d.L1),
        L2: _pick(_d.L2),
        L3: _pick(_d.L3),
      };
    },
    getLevelItems: function (level) {
      return _d["L" + level].map(function (x) {
        return { id: x.id, name: x.name };
      });
    },
    getWheelSegments: function (level) {
      return _d["L" + level].map(function (x) {
        return { id: x.id, name: x.name, weight: 1 };
      });
    },
    getItem: function (level, id) {
      return _d["L" + level].find(function (x) {
        return x.id === id;
      });
    },
  };
})(window);
