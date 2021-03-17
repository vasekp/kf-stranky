'use strict';

let state = new State();
let ell;

window.addEventListener('DOMContentLoaded', function() {
  let originFun = function() { return [0, 0]; };
  let release = function(s, c, over) { if(s==='release') state.release(); over.refresh(); }
  let graphs = [];
  let updateGraphs = function() {
    ell = state.ellipse();
    graphs.forEach(function(g) { g.refresh(); });
  };
  /***** D(α) *****/
  {
    let coordFun = function() { return state.tempA; };
    let over = new Overlay(document.getElementById('op-d'),
      { xMin: -1, xMax: 1, yMin: -1, yMax: 1, padding: .8 }, release);
    over.addControl(new Label(-1, 1, 'black', 'D(α)'));
    over.addControl(new CoordAxes(-1, 1, -1, 1, 'Re α', 'Im α'));
    over.addControl(new AbsControl(coordFun, 'cross', '#F88',
      function(x, y) { state.tempA = [x, y]; over.refresh(); updateGraphs(); }));
    over.addControl(new Arrow(originFun, coordFun, '#88F'));
    over.addControl(new GridMarker(function() { return state.tmpMatrix(); }));
  }
  /***** S(ζ) *****/
  {
    let coordFun = function() { return state.tempZ; };
    let over = new Overlay(document.getElementById('op-s'),
      { xMin: -1, xMax: 1, yMin: -1, yMax: 1, padding: .8 }, release);
    over.addControl(new Label(-1, 1, 'black', 'S(ζ)'));
    over.addControl(new CoordAxes(-1, 1, -1, 1, 'Re √ζ', 'Im √ζ'));
    over.addControl(new AbsControl(coordFun, 'cross', '#F88',
      function(x, y) { state.tempZ = [x, y]; over.refresh(); updateGraphs(); }));
    over.addControl(new Arrow(originFun, coordFun, '#88F'));
    over.addControl(new GridMarker(function() { return state.tmpMatrix(); }));
  }
  /***** U(t) *****/
  {
    let coordFun = function() { return [state.tempT, 0]; };
    let over = new Overlay(document.getElementById('op-u'),
      { xMin: -1, xMax: 1, yMin: -1, yMax: 1, padding: .8 }, release);
    over.addControl(new Label(-1, 1, 'black', 'U(t)'));
    over.addControl(new CoordAxis(-1, 1, -.1, .1, 't', [[0, '']]));
    over.addControl(new AbsControl(coordFun, 'horz', '#F88',
      function(x, y) { state.tempT = x; over.refresh(); updateGraphs(); }));
    over.addControl(new GridMarker(function() { return state.tmpMatrix(); }));
  }
  /***** Phase space diagram *****/
  {
    let over = new Overlay(document.getElementById('pq'),
      { xMin: -5, yMin: -5, xMax: 5, yMax: 5 });
    over.addControl(new CoordAxes(-4, 4, -4, 4,
      '<tspan>X</tspan><tspan font-size="80%" dy=".3em">0</tspan>',
      '<tspan>X</tspan><tspan font-size="80%" dy=".3em">π/2</tspan>'));
    over.addControl(new EllipseMarker());
    over.addControl(new AbsControl(state.center, 'cross', '#F88', function(x, y) {
      state.resetAlpha([x, y]);
      updateGraphs();
    }));
    let onZeta = function(dx, dy) {
      let abs = hypot(dx, dy), arg = Math.atan2(dy, dx);
      state.resetZeta(cxpolar(-Math.log(abs), arg * 2));
      updateGraphs();
    };
    over.addControl(new CenterControl(function() {
      return [ell.x + ell.major * Math.cos(ell.angle), ell.y + ell.major * Math.sin(ell.angle)];
    }, state.center, 'bent', '#88F', onZeta));
    over.addControl(new CenterControl(function() {
      return [ell.x - ell.major * Math.cos(ell.angle), ell.y - ell.major * Math.sin(ell.angle)];
    }, state.center, 'bent', '#88F', onZeta));
    /*over.addControl(new CenterControl(function() {
      return [ell.x + ell.minor * Math.sin(ell.angle), ell.y - ell.minor * Math.cos(ell.angle)];
    }, state.center, 'bent', '#88F', onZeta));
    over.addControl(new CenterControl(function() {
      return [ell.x - ell.minor * Math.sin(ell.angle), ell.y + ell.minor * Math.cos(ell.angle)];
    }, state.center, 'bent', '#88F', onZeta));*/
    graphs.push(over);
  }
  /***** Photon number distribution *****/
  {
    let over = new Overlay(document.getElementById('graph-n'),
      { xMin: -.5, xMax: 20, yMin: -.1, yMax: 1.1, padding: .6 });
    over.addControl(new NGraphMarker());
    let marks = [];
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 15, 17, 19].forEach(function(x) {
      marks.push([x+.5, x]); });
    over.addControl(new CoordAxes(-.5, 20, -.05, 1.1,
      'n', 'P(n)', marks, [1]));
    over.addControl(new Label(18, 1.1, '#F00', '⟨n⟩'));
    over.addControl(new Label(18, 0.9, '#0C0', '(Δn)²'));
    graphs.push(over);
  }
  /***** Quadrature distribution *****/
  {
    let over = new Overlay(document.getElementById('graph-sq'),
      { xMin: -.5, xMax: 6.4, yMin: -.1, yMax: 1.1, padding: .6 });
    over.addControl(new CoordAxes(-.15, 6.4, -.05, 1.1,
      'θ',
      '<tspan>(Δx</tspan><tspan font-size=".8" dy=".4,-.4">θ&#x200B;</tspan><tspan>)</tspan><tspan>²</tspan>',
      [0, [Math.PI/2, 'π/2'], [Math.PI, 'π'], [Math.PI*3/2, '3π/2'], [2*Math.PI, '2π']], [.5]));
    over.addControl(new DashedPath(function() { return [[0,.5], [6.4,.5]]; }, 'red'));
    over.addControl(new QGraphMarker());
    graphs.push(over);
  }

  document.getElementById('reset-d').addEventListener('click', function() {
    state.resetAlpha();
    updateGraphs();
  });
  document.getElementById('reset-s').addEventListener('click', function() {
    state.resetZeta();
    updateGraphs();
  });
});

function GridMarker(trfFun) {
  BaseMarker.call(this);
  let repeat = String.prototype.repeat
    ? function(str, cnt) { return str.repeat(cnt); }
    : function(str, cnt) {
      let ret = '';
      for(let i = 0; i < cnt; i++)
        ret += str;
      return ret;
    };
  this.svgFun = function() {
    let xy1 = m2v(this.owner.c2w, [-4, -4]),
        xy2 = m2v(this.owner.c2w, [4, 4]),
        dxy = [(xy2[0] - xy1[0])/20, (xy2[1] - xy1[1])/20];
    let start = 'M ' + xy1[0] + ' ' + xy1[1],
        twoVert = ' V ' + xy2[1] + ' m ' + dxy[0] + ' 0 V ' + xy1[1] + ' m ' + dxy[0] + ' 0 ',
        twoHorz = ' H ' + xy2[0] + ' m 0 ' + dxy[1] + ' H ' + xy1[0] + ' m 0 ' + dxy[1];
    return '<path stroke="black" stroke-width="0.03" stroke-opacity="0.3" '
      + 'd="' + start + repeat(twoVert, 10) + start + repeat(twoHorz, 10) + '"/>';
  };
  this.update = function() {
    let mx = m2mul(this.owner.c2w, m2mul(trfFun(), this.owner.w2c));
    this.elm.setAttribute('transform', 'matrix(' + mx.join(', ') + ')');
  }
}

function EllipseMarker() {
  BaseMarker.call(this);
  this.svgFun = function() {
    return '<path stroke="black" stroke-width="0.06" fill="none" stroke-dasharray=".1 .1"/>';
  };
  this.update = function() {
    let scale = this.owner.c2w[0];
    if(!ell)
      ell = state.ellipse();
    let sparams = [scale * ell.major, scale * ell.minor, -ell.angle * 180 / Math.PI].join(' ');
    let p1 = m2v(this.owner.c2w, [ell.x + ell.major * Math.cos(ell.angle), ell.y + ell.major * Math.sin(ell.angle)]);
    let p2 = m2v(this.owner.c2w, [ell.x - ell.major * Math.cos(ell.angle), ell.y - ell.major * Math.sin(ell.angle)]);
    this.elm.querySelector('path').setAttribute('d', 'M ' + p1.join(' ')
      + ' A ' + sparams + ' 0 0 ' + p2.join(' ')
      + ' A ' + sparams + ' 0 0 ' + p1.join(' '));
    /*DEBUG:
    let mx = state.tmpMatrix();
    let p11 = m2v(this.owner.c2w, [mx[4] + mx[0], mx[5] + mx[1]]);
    let p12 = m2v(this.owner.c2w, [mx[4] + mx[2], mx[5] + mx[3]]);
    let p13 = m2v(this.owner.c2w, [mx[4] - mx[0], mx[5] - mx[1]]);
    let p14 = m2v(this.owner.c2w, [mx[4] - mx[2], mx[5] - mx[3]]);
    this.elm.querySelector('path').setAttribute('d', 'M ' + p1.join(' ')
      + ' h .2 -.2 '
      + ' A ' + sparams + ' 0 0 ' + p2.join(' ')
      + ' h .2 -.2 '
      + ' A ' + sparams + ' 0 0 ' + p1.join(' ')
      + ' M ' + p11.join(' ') + ' L ' + p12.join(' ') + ' ' + p13.join(' ') + ' ' + p14.join(' ') + ' z'
    );*/
  };
}

function NGraphMarker() {
  BaseMarker.call(this);
  this.svgFun = function() {
    let svg = '<g stroke="#f93" fill="#fc9" stroke-width="0.06" transform="scale(1 -1)">';
    for(let i = 0; i < 20; i++) {
      let xy1 = m2v(this.owner.c2w, [i+.5-.3,0]),
          xy2 = m2v(this.owner.c2w, [i+.5+.3,.5]);
      svg += '<rect x="' + xy1[0] + '" y="' + -xy1[1] + '" '
        + 'width="' + (xy2[0]-xy1[0]) + '" height="' + -(xy2[1]-xy1[1]) + '"/>';
    }
    svg += '</g>';
    {
      let xy1 = m2v(this.owner.c2w, [.5, 0]),
          xy2 = m2v(this.owner.c2w, [.5, 1.1]);
      svg += '<path id="n-exp" stroke="#F00" stroke-width=".06" stroke-dasharray=".5 .5" stroke-dashoffset="-.3" '
        + 'd="M ' + xy1.join(' ') + ' L ' + xy2.join(' ') + '"/>';
      svg += '<path id="n-var" stroke="#0C0" stroke-width=".06" stroke-dasharray=".5 .5" stroke-dashoffset=".2" '
        + 'd="M ' + xy1.join(' ') + ' L ' + xy2.join(' ') + '"/>';
    }
    return svg;
  };
  this.update = function() {
    let scaleX = Math.abs(this.owner.c2w[0]);
    let scaleY = Math.abs(this.owner.c2w[3]);
    let dist = state.distribution();
    let qsa = this.elm.querySelectorAll('rect');
    for(let n = 0; n < qsa.length; n++)
      qsa[n].setAttribute('height', scaleY * dist(n));
    let stat = state.nStat();
    this.elm.querySelector('#n-exp').setAttribute('transform', 'translate(' + scaleX * stat.exp + ', 0)');
    this.elm.querySelector('#n-var').setAttribute('transform', 'translate(' + scaleX * stat.dev2 + ', 0)');
    let qm = (stat.dev2 - stat.exp)/stat.exp;
    let qmText = qm.toFixed(2);
    if(qmText === '-0.00' || qmText === "NaN")
      qmText = '0.00';
    document.getElementById('val-qm').setAttribute('data-value', qmText);
  }
}

function QGraphMarker() {
  BaseMarker.call(this);
  this.svgFun = function() {
    return '<path stroke="#06f" fill="none" stroke-width="0.09"/>';
  };
  this.update = function() {
    let f = state.qdev2();
    let w = function(x, y) {
      return m2v(this.owner.c2w, [x, y]).join(' ');
    }.bind(this);
    const div = Math.PI / 10;
    let vLast = f(0);
    let d = 'M ' + w(0, vLast) + ' Q';
    for(let theta = div; theta < 2*Math.PI + div/2; theta += div) {
      let val = f(theta);
      let vHalf = f(theta - div/2);
      d += ' ' + w(theta - div/2, 2*vHalf - (val + vLast) / 2)
        + ' ' + w(theta, val);
      vLast = val;
    }
    this.elm.querySelector('path').setAttribute('d', d);
    let sq = f.min - 0.5;
    let sqText = sq.toFixed(2);
    if(sqText === '-0.00')
      sqText = '0.00';
    document.getElementById('val-sq').setAttribute('data-value', sqText);
  }.bind(this);
}

function State() {
  this.tempA = [0, 0];
  this.tempZ = [0, 0];
  this.tempT = 0;
  this._mx = [1, 0, 0, 1, 0, 0];

  this.release = function() {
    this._mx = this.curMatrix();
    this.tempA = [0, 0];
    this.tempZ = [0, 0];
    this.tempT = 0;
  }.bind(this);

  this.resetAlpha = function(alpha) {
    if(alpha) {
      this._mx[4] = alpha[0];
      this._mx[5] = alpha[1];
    } else
      this._mx[4] = this._mx[5] = 0;
  }.bind(this);

  this.resetZeta = function(zeta) {
    if(zeta) {
      let r = cxabs(zeta), phi = cxarg(zeta),
          cosh = cosh(r), sinh = sinh(r);
      this._mx[0] = cosh - Math.cos(phi) * sinh;
      this._mx[1] = this._mx[2] = -Math.sin(phi) * sinh;
      this._mx[3] = cosh + Math.cos(phi) * sinh;
    } else {
      this._mx[0] = this._mx[3] = 1;
      this._mx[1] = this._mx[2] = 0;
    }
  }.bind(this);

  this.tmpMatrix = function() {
    // Invariant: no two temps simultaneously nonzero
    if(this.tempZ[0] !== 0 || this.tempZ[1] !== 0) {
      let zx = this.tempZ[0], zy = this.tempZ[1],
          r = (zx*zx + zy*zy) / 10,
          phi = Math.atan2(zy, zx) * 2,
          chr = cosh(r), shr = sinh(r),
          cphi = Math.cos(phi), sphi = Math.sin(phi);
      return [chr - cphi*shr, -sphi*shr, -sphi*shr, chr + cphi*shr, 0, 0];
    } else if(this.tempT !== 0) {
      let cos = Math.cos(this.tempT),
          sin = Math.sin(this.tempT);
      return [cos, -sin, sin, cos, 0, 0];
    } else
      return [1, 0, 0, 1, this.tempA[0], this.tempA[1]];
  }.bind(this);

  this.curMatrix = function() {
    return m2mul(this.tmpMatrix(), this._mx);
  }.bind(this);

  this.center = function() {
    return this.curMatrix().slice(4);
  }.bind(this);

  this.ellipse = function() {
    let dc = this.decompose();
    return {
      major: dc.cosh + dc.sinh,
      minor: dc.cosh - dc.sinh,
      angle: (dc.phi + Math.PI) / 2,
      x: dc.alpha[0], y: dc.alpha[1]
    };
  }.bind(this);

  this.decompose = function() {
    let mx = this.curMatrix();
    let alpha = [mx[4], mx[5]];
    let mx2 = m2mul(mx, m2tr(mx));
    let cosh2 = (mx2[0] + mx2[3])/2, cosh = Math.sqrt((cosh2 + 1)/2), sinh = Math.sqrt(Math.max((cosh2 - 1)/2, 0));
    let phi = Math.atan2(-mx2[1], -(mx2[0] - cosh2));
    return {alpha: alpha, cosh: cosh, sinh: sinh, phi: phi};
  }

  this.distribution = function() {
    let dc = this.decompose();
    let eta = cxpolar(dc.sinh/dc.cosh, dc.phi);
    let beta = cxadd(dc.alpha, cxmulc(eta, dc.alpha)), beta2 = cxmul(beta, beta);
    let pref = cxmulr(cxexp(cxmulr(cxmulc(beta, dc.alpha), -1/2)), 1/Math.sqrt(dc.cosh));
    return function(n) {
      let n1 = [1,0], n2 = n % 2 ? beta : [1,0], d1 = 1, d2 = 1;
      let a1 = [[1,0]], a2 = [n2];
      for(let m = 2; m <= n; m += 2) {
        n1 = cxmul(n1, eta);
        d1 *= -m;
        a1.push(cxdivr(n1, d1));
      }
      for(let m = 2+(n%2); m <= n; m += 2) {
        n2 = cxmul(n2, beta2);
        d2 *= m*(m-1);
        a2.push(cxdivr(n2, d2));
      }
      let pref2 = cxmulr(pref, Math.sqrt(d2));
      let sum = [0,0];
      while(a1.length > 0)
        sum = cxadd(sum, cxmul(cxmul(pref2, a1.shift()), a2.pop()));
      return cxnorm2(sum);
    }
  }.bind(this);

  this.nStat = function() {
    let dc = this.decompose();
    let phiAlpha = cxarg(dc.alpha);
    return {
      exp: cxnorm2(dc.alpha) + dc.sinh * dc.sinh,
      dev2: 2*Math.pow(dc.sinh*dc.cosh, 2) + cxnorm2(dc.alpha) *
        (Math.pow((dc.cosh + dc.sinh)*Math.sin(phiAlpha - dc.phi/2), 2)
        + Math.pow((dc.cosh - dc.sinh) * Math.cos(phiAlpha - dc.phi/2), 2))
    };
  }.bind(this);

  this.qdev2 = function() {
    let dc = this.decompose();
    let f = function(theta) {
      return (Math.pow((dc.cosh + dc.sinh) * Math.sin(theta - dc.phi/2), 2)
        + Math.pow((dc.cosh - dc.sinh) * Math.cos(theta - dc.phi/2), 2)) / 2;
    };
    f.min = Math.pow(dc.cosh - dc.sinh, 2) / 2;
    f.max = Math.pow(dc.cosh + dc.sinh, 2) / 2;
    return f;
  }.bind(this);
}
