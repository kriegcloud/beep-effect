{
  description = "beep-effect2 development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Runtime
            bun
            nodejs_22

            # Quality tools
            typos
            gitleaks
            lefthook

            # Docker
            docker-compose
          ];

          shellHook = ''
            echo "beep-effect2 dev shell loaded"
            export BUN_INSTALL="$HOME/.bun"
            export BUN_INSTALL_CACHE_DIR="/tmp/$USER-beep-effect3-bun-install-cache"
            mkdir -p "$BUN_INSTALL_CACHE_DIR"
            export PATH="$BUN_INSTALL/bin:$PATH"
          '';
        };
      });
}
