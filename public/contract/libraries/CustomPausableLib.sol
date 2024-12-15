// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";

library CustomPausableLib {
    struct PausableStorage {
        // Mapa para rastrear el estado de pausa de funciones individuales
        mapping(bytes4 => bool) pausedFunctions;
        address owner;
    }

    // Eventos para rastrear cambios en el estado de pausa
    event FunctionPaused(bytes4 indexed functionSelector);
    event FunctionUnpaused(bytes4 indexed functionSelector);

    // Modificador para verificar si una función específica está pausada
    modifier whenFunctionNotPaused(
        PausableStorage storage self,
        bytes4 functionSelector
    ) {
        require(
            !self.pausedFunctions[functionSelector],
            "CustomPausableLib: Function is paused"
        );
        _;
    }

    // Función para pausar una función específica
    function pauseFunction(
        PausableStorage storage self,
        bytes4 functionSelector
    ) internal {
        require(
            msg.sender == self.owner,
            "CustomPausableLib: Only owner can pause"
        );
        self.pausedFunctions[functionSelector] = true;
        emit FunctionPaused(functionSelector);
    }

    // Función para despausar una función específica
    function unpauseFunction(
        PausableStorage storage self,
        bytes4 functionSelector
    ) internal {
        require(
            msg.sender == self.owner,
            "CustomPausableLib: Only owner can unpause"
        );
        self.pausedFunctions[functionSelector] = false;
        emit FunctionUnpaused(functionSelector);
    }
}
