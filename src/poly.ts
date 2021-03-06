if (typeof window !== 'undefined') {
  if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
    function(s) {
      var matches = ((this as any).document || this.ownerDocument).querySelectorAll(s),
          i,
          el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = (el.parentElement as HTMLElement)))
      return el;
    };
  }
}
