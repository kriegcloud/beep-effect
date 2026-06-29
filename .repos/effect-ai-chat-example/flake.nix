{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/b62d2a9";
  };
  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems =
        function:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system: function nixpkgs.legacyPackages.${system}
        );
    in
    {
      formatter = forAllSystems (pkgs: pkgs.alejandra);
      devShells = forAllSystems (pkgs: {
        default = pkgs.mkShell {
          packages = with pkgs; [
            corepack
            nodejs_22
            nodePackages.pnpm
            postgresql
          ];
        };
      });
    };
}
