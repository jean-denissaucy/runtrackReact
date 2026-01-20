<?php
namespace App\Controllers;


 use Core\BaseController;
 use App\Models\ArticleModel;

 class ArticleController extends BaseController
 {
    public function index()
    {
        $articleModel = new ArticleModel();
        $articles = $articleModel->all();
        $this->render('article/index',['articles' => $articles]);

    }

    public function show($id)

    {
        $articleModel = new ArticleModel();
        $article = $articleModel->find($id);
        $this->render('article/show', ['article' => $article]);
    }
 }