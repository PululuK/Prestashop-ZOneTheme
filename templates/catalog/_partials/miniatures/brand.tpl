{**
 * 2007-2017 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2017 PrestaShop SA
 * @license   http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 *}
{block name='brand'}
  <li class="brand box-bg">
    <div class="brand-img">
      <a href="{$brand.url}"><img class="img-fluid img-thumbnail" src="{$brand.image}" alt="{$brand.name}"></a>
    </div>
    <div class="brand-infos">
      <h5><a href="{$brand.url}">{$brand.name}</a></h5>
      {$brand.text nofilter}
    </div>
    <div class="brand-product-count">
      <a href="{$brand.url}">{$brand.nb_products}</a>
    </div>
    <div class="brand-products">
      <a class="btn btn-primary" href="{$brand.url}">{l s='View products' d='Shop.Theme.Actions'}</a>
    </div>
  </li>
{/block}