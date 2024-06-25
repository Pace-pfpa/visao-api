import { Router } from "express";
import { getInformationFromSapienForSamirController } from "../modules/GetInformationFromSapienForSamir";
import { atualizacaoDossiePrevidenciarioController } from "../modules/AtualizacaoDossiePrevidenciario";
import { verificadorValidadeDossiePrevidenciarioController } from '../modules/VerificadorValidadeDossiePrevidenciario/index';
import { verificadorDeDupliciadeController } from "../modules/VerificadorDeDupliciade";

//const sessao = request.session();

export const routerGetInformationsForSamir = Router();

/**
 * @swagger
 * /samir/getInformationFromSapienForSamir:
 *   post:
 *     summary: get Information From Sapien For Samir
 *     tags: [GetInformationFromSapien]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetInformationsFromSapiens'
 *     responses:
 *       200:
 *         description: The user was successfully login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InformationsForCalcule'
 *                 
 *       500:
 *         description: Some server error
 *       400:
 *         description: The request error
 */


routerGetInformationsForSamir.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`Requisição ${req.method} ${req.originalUrl} levou ${duration}ms`);
    });
    next();
});



routerGetInformationsForSamir.post("/getInformationFromSapienForSamir", async (req, res) => {

    const oldSend = res.send;
    res.send = function(data) {
        console.log(`Tamanho da resposta: ${Buffer.byteLength(data)} bytes`);
        return oldSend.apply(res, arguments); // Adicionado 'return' aqui
    };
    
    return getInformationFromSapienForSamirController.handle(req, res);
})

/**
 * @swagger
 * /samir/atualizaoDossiePrevidenciario:
 *   post:
 *     summary: get Information From Sapien For Samir
 *     tags: [GetInformationFromSapien]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetInformationsFromSapiens'
 *     responses:
 *       200:
 *         description: The user was successfully login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InformationsForCalcule'
 *                 
 *       500:
 *         description: Some server error
 *       400:
 *         description: The request error
 */


routerGetInformationsForSamir.post("/atualizaoDossiePrevidenciario", async (req, res) => {
    return atualizacaoDossiePrevidenciarioController.handle(req, res);
})



/**
 * @swagger
 * /samir/verificadorValidadeDossiePrevidenciario:
 *   post:
 *     summary: get Information From Sapien For Samir
 *     tags: [GetInformationFromSapien]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetInformationsFromSapiens'
 *     responses:
 *       200:
 *         description: The user was successfully login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InformationsForCalcule'
 *                 
 *       500:
 *         description: Some server error
 *       400:
 *         description: The request error
 */
routerGetInformationsForSamir.post("/verificadorValidadeDossiePrevidenciario", async (req, res) => {
    return verificadorValidadeDossiePrevidenciarioController.handle(req, res);
})

/**
 * @swagger
 * /samir/verificadorDeDupliciade:
 *   post:
 *     summary: get Information From Sapien For Samir
 *     tags: [GetInformationFromSapien]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetInformationsFromSapiens'
 *     responses:
 *       200:
 *         description: The user was successfully login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InformationsForCalcule'
 *                 
 *       500:
 *         description: Some server error
 *       400:
 *         description: The request error
 */
routerGetInformationsForSamir.post("/verificadorDeDupliciade", async (req, res) => {
    return verificadorDeDupliciadeController.handle(req, res);
})