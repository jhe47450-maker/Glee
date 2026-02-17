{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.npm
  ];
  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.openssl
    ];
  };
}
